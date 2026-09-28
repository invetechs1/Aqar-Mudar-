import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { apiMessages, getRequestLocale } from "@/lib/api-errors";

const schema = z.object({
  structuralCondition: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR"]),
  finishingQuality: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR"]),
  electricalCondition: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR"]),
  mechanicalCondition: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR"]),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  estimatedLifespan: z.number().int().min(1).max(100),
  recommendations: z.string().min(5).max(2000),
  valueUpliftPotential: z.number().min(0).max(200).optional(),
  upliftScope: z.string().max(1000).optional(),
  upliftCost: z.number().min(0).optional(),
  upliftDurationMonths: z.number().min(0).optional(),
  expectedReturnPct: z.number().min(0).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const t = apiMessages(getRequestLocale());
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: t.forbidden }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: t.invalidData, details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const property = await prisma.property.findUnique({ where: { id: params.id } });
  if (!property) return NextResponse.json({ error: t.notFound }, { status: 404 });

  await prisma.$transaction([
    prisma.engineeringReport.upsert({
      where: { propertyId: params.id },
      create: { ...parsed.data, propertyId: params.id },
      update: parsed.data,
    }),
    prisma.property.update({
      where: { id: params.id },
      data: { status: "CERTIFIED", isCertified: true },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
