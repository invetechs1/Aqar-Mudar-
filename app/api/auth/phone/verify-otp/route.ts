import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { consumeToken } from "@/lib/notify";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { apiMessages, getRequestLocale } from "@/lib/api-errors";

const schema = z.object({ code: z.string().length(6) });

export async function POST(req: NextRequest) {
  const t = apiMessages(getRequestLocale());
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: t.unauthorized }, { status: 401 });

  const rl = await rateLimit(clientKey(req, `verify-otp:${session.user.id}`), 5, 600);
  if (!rl.allowed) return NextResponse.json({ error: t.tooManyAttempts }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: t.invalidCode }, { status: 400 });

  const result = await consumeToken(parsed.data.code, "PHONE_OTP");
  if (!result || result.userId !== session.user.id) {
    return NextResponse.json({ error: t.codeInvalidOrExpired }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { phoneVerified: new Date() },
  });
  await audit({
    action: "user.phone_verified",
    resource: "user",
    resourceId: session.user.id,
    userId: session.user.id,
    request: req,
  });
  return NextResponse.json({ ok: true });
}
