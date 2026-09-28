import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendPasswordReset } from "@/lib/notify";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { apiMessages, getRequestLocale } from "@/lib/api-errors";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const t = apiMessages(getRequestLocale());
  const rl = await rateLimit(clientKey(req, "forgot-password"), 3, 900);
  if (!rl.allowed) return NextResponse.json({ error: t.tooManyAttempts }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: t.invalidData }, { status: 400 });

  await sendPasswordReset(parsed.data.email).catch(() => {});

  return NextResponse.json({ ok: true });
}
