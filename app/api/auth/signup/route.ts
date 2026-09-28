import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, passwordSchema } from "@/lib/password";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { audit } from "@/lib/audit";
import { sendEmailVerification } from "@/lib/notify";
import { recordConsentBatch } from "@/lib/consent";
import { apiMessages, getRequestLocale } from "@/lib/api-errors";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(200),
  password: passwordSchema,
  phone: z
    .string()
    .regex(/^\+?[0-9\s-]{8,20}$/)
    .optional(),
  role: z.enum(["OWNER", "INVESTOR"]).default("OWNER"),
  consent: z.object({
    terms: z.literal(true),
    privacy: z.literal(true),
    disclaimer: z.literal(true),
  }),
});

export async function POST(req: NextRequest) {
  const t = apiMessages(getRequestLocale());

  const rl = await rateLimit(clientKey(req, "signup"), 5, 300);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: t.tooManyAttemptsRetry },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: t.invalidData, details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, password, phone, role } = parsed.data;
  const emailLower = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: emailLower } });
  if (existing) {
    return NextResponse.json({ error: t.emailInUse }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email: emailLower, passwordHash, phone, role },
    select: { id: true, email: true, name: true, role: true },
  });

  // Persist one row per accepted document — versioned, timestamped, with IP.
  await recordConsentBatch({
    userId: user.id,
    scope: "SIGNUP",
    clauses: [
      { key: "terms",      documentSlug: "terms" },
      { key: "privacy",    documentSlug: "privacy" },
      { key: "disclaimer", documentSlug: "disclaimer" },
    ],
    request: req,
  });

  await audit({
    action: "user.signup",
    resource: "user",
    resourceId: user.id,
    userId: user.id,
    request: req,
  });

  await sendEmailVerification(user.id, emailLower).catch(() => {});

  return NextResponse.json({ user }, { status: 201 });
}
