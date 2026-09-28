import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createPayment, isMoyasarConfigured } from "@/lib/moyasar";
import { env } from "@/lib/env";
import { audit } from "@/lib/audit";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { hasCompleteConsent } from "@/lib/consent";
import { features } from "@/lib/features";
import { apiMessages, getRequestLocale } from "@/lib/api-errors";

const schema = z.object({
  propertyId: z.string().min(1),
  shares: z.number().int().positive().max(10000),
});

export async function POST(req: NextRequest) {
  const t = apiMessages(getRequestLocale());

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: t.unauthorized }, { status: 401 });

  const rl = await rateLimit(clientKey(req, `pay:${session.user.id}`), 10, 300);
  if (!rl.allowed) return NextResponse.json({ error: t.tooManyAttempts }, { status: 429 });

  if (!isMoyasarConfigured()) {
    return NextResponse.json(
      { error: t.moyasarNotConfigured },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: t.invalidData }, { status: 400 });

  const { propertyId, shares } = parsed.data;

  if (!features.partialSale) {
    return NextResponse.json(
      { error: t.partialSaleUnavailable },
      { status: 400 }
    );
  }

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) return NextResponse.json({ error: t.notFound }, { status: 404 });
  if (
    property.listingType !== "PARTIAL_SALE" ||
    !property.totalShares ||
    !property.sharePriceSAR
  ) {
    return NextResponse.json({ error: t.notAvailablePartialSale }, { status: 400 });
  }

  // Server-side gate — client validation is not enough. The investor must have
  // a complete, current-version acknowledgement recorded for this property.
  const consented = await hasCompleteConsent({
    userId: session.user.id,
    scope: "INVEST_ACK",
    scopeRefId: propertyId,
  });
  if (!consented) {
    return NextResponse.json(
      {
        error: t.acknowledgementRequired,
        redirect: `/invest/${propertyId}/acknowledge`,
      },
      { status: 412 }
    );
  }
  const remaining = property.totalShares - property.soldShares;
  if (shares > remaining) {
    return NextResponse.json({ error: t.maxSharesAvailable(remaining) }, { status: 400 });
  }

  const amountSAR = shares * property.sharePriceSAR;
  const amountHalalas = Math.round(amountSAR * 100);

  const investment = await prisma.investment.create({
    data: {
      shares,
      amountSAR,
      propertyId,
      userId: session.user.id,
      provider: "MOYASAR",
    },
  });

  const payment = await createPayment({
    amountHalalas,
    description: `Aqar Mudar — ${property.title} — ${shares} shares`,
    callbackUrl: `${env.NEXTAUTH_URL}/properties/${propertyId}/invest/callback?investment=${investment.id}`,
    metadata: {
      investmentId: investment.id,
      propertyId,
      userId: session.user.id,
      shares: String(shares),
    },
  });

  await prisma.investment.update({
    where: { id: investment.id },
    data: { providerRef: payment.id },
  });

  await audit({
    action: "payment.moyasar.create",
    resource: "investment",
    resourceId: investment.id,
    userId: session.user.id,
    metadata: { paymentId: payment.id, amountSAR },
    request: req,
  });

  return NextResponse.json({
    investmentId: investment.id,
    paymentId: payment.id,
    publishableKey: env.MOYASAR_PUBLISHABLE_KEY,
    amountSAR,
  });
}
