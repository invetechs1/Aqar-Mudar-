import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { checkVerification } from "@/lib/nafath";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { apiMessages, getRequestLocale } from "@/lib/api-errors";

const schema = z.object({ transactionId: z.string().min(4), nationalId: z.string().regex(/^\d{10}$/) });

export async function POST(req: NextRequest) {
  const t = apiMessages(getRequestLocale());
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: t.unauthorized }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: t.invalidData }, { status: 400 });

  const result = await checkVerification(parsed.data.transactionId);
  if (!result.verified) {
    return NextResponse.json({ verified: false, message: t.notYetVerified });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      nafathVerified: new Date(),
      nationalId: parsed.data.nationalId,
      name: result.fullNameAr ?? undefined,
    },
  });
  await audit({
    action: "user.nafath_verified",
    resource: "user",
    resourceId: session.user.id,
    userId: session.user.id,
    request: req,
  });
  return NextResponse.json({ verified: true });
}
