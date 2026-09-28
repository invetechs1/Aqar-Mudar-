import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordConsentBatch, REQUIRED_CLAUSES, type DocumentSlug } from "@/lib/consent";
import { audit } from "@/lib/audit";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { apiMessages, getRequestLocale } from "@/lib/api-errors";

const schema = z.object({
  propertyId: z.string().min(1),
  clauses: z.array(
    z.object({
      key: z.string().min(1),
      documentSlug: z.enum(["terms", "privacy", "disclaimer", "risk", "aml", "refund"]).optional(),
    })
  ),
});

export async function POST(req: NextRequest) {
  const t = apiMessages(getRequestLocale());
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: t.unauthorized }, { status: 401 });

  const rl = await rateLimit(clientKey(req, `consent:${session.user.id}`), 20, 300);
  if (!rl.allowed) return NextResponse.json({ error: t.tooManyAttempts }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: t.invalidData }, { status: 400 });

  // Every required clause must be present in this submission.
  const required = new Set(REQUIRED_CLAUSES.INVEST_ACK);
  const submitted = new Set(parsed.data.clauses.map((c) => c.key));
  const missing = [...required].filter((k) => !submitted.has(k));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: t.missingAcknowledgements, missing },
      { status: 400 }
    );
  }

  const property = await prisma.property.findUnique({ where: { id: parsed.data.propertyId } });
  if (!property) return NextResponse.json({ error: t.propertyNotFound }, { status: 404 });

  await recordConsentBatch({
    userId: session.user.id,
    scope: "INVEST_ACK",
    scopeRefId: parsed.data.propertyId,
    clauses: parsed.data.clauses.map((c) => ({
      key: c.key,
      documentSlug: c.documentSlug as DocumentSlug | undefined,
    })),
    request: req,
  });

  await audit({
    action: "consent.invest_ack",
    resource: "property",
    resourceId: parsed.data.propertyId,
    userId: session.user.id,
    metadata: { clauses: parsed.data.clauses.map((c) => c.key) },
    request: req,
  });

  return NextResponse.json({ ok: true });
}
