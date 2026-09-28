import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeToken } from "@/lib/notify";
import { audit } from "@/lib/audit";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { apiMessages, getRequestLocale } from "@/lib/api-errors";

export async function POST(req: NextRequest) {
  const t = apiMessages(getRequestLocale());
  const rl = await rateLimit(clientKey(req, "verify-email"), 10, 300);
  if (!rl.allowed) return NextResponse.json({ error: t.tooManyAttempts }, { status: 429 });

  const { token } = await req.json().catch(() => ({}));
  if (!token) return NextResponse.json({ error: t.missingCode }, { status: 400 });

  const result = await consumeToken(String(token), "EMAIL_VERIFY");
  if (!result?.userId) {
    return NextResponse.json({ error: t.codeInvalidOrExpired }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: result.userId },
    data: { emailVerified: new Date() },
  });
  await audit({ action: "user.email_verified", resource: "user", resourceId: result.userId, userId: result.userId, request: req });
  return NextResponse.json({ ok: true });
}
