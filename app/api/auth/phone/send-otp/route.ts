import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { sendPhoneOTP } from "@/lib/notify";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { apiMessages, getRequestLocale } from "@/lib/api-errors";

const schema = z.object({
  phone: z.string().regex(/^\+?[0-9\s-]{8,20}$/),
});

export async function POST(req: NextRequest) {
  const t = apiMessages(getRequestLocale());
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: t.unauthorized }, { status: 401 });

  const rl = await rateLimit(clientKey(req, `otp:${session.user.id}`), 3, 600);
  if (!rl.allowed) return NextResponse.json({ error: t.tooManyAttempts }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: t.invalidNumber }, { status: 400 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { phone: parsed.data.phone, phoneVerified: null },
  });
  await sendPhoneOTP(session.user.id, parsed.data.phone);

  return NextResponse.json({ ok: true });
}
