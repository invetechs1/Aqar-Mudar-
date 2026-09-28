import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { recordConsentBatch } from "@/lib/consent";
import { features } from "@/lib/features";
import { apiMessages, getRequestLocale } from "@/lib/api-errors";

const listingEnum = z.enum(["SALE", "PARTIAL_SALE", "INVESTMENT"]);

const createSchema = z.object({
  title: z.string().min(4).max(120),
  description: z.string().min(20).max(2000),
  city: z.string().min(2).max(60),
  district: z.string().max(80).optional(),
  address: z.string().max(200).optional(),
  propertyType: z.enum(["APARTMENT", "VILLA", "LAND", "COMMERCIAL", "BUILDING"]),
  listingType: listingEnum,
  price: z.number().positive(),
  area: z.number().positive(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  yearBuilt: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  totalShares: z.number().int().positive().optional(),
  sharePriceSAR: z.number().positive().optional(),
  images: z.array(z.string().min(1)).max(10).default([]),
  attestation: z.object({
    ownerOrAgent: z.literal(true),
    dataAccuracy: z.literal(true),
  }),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const listing = searchParams.get("listing") ?? undefined;
  const certifiedOnly = searchParams.get("certified") === "1";

  const properties = await prisma.property.findMany({
    where: {
      ...(city && { city }),
      ...(type && { propertyType: type as any }),
      ...(listing && { listingType: listing as any }),
      ...(certifiedOnly && { isCertified: true }),
    },
    include: {
      report: true,
      owner: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ properties });
}

export async function POST(req: NextRequest) {
  const t = apiMessages(getRequestLocale());

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: t.unauthorized }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: t.invalidData, details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Enforce the fractional-sale feature flag server-side.
  if (parsed.data.listingType === "PARTIAL_SALE" && !features.partialSale) {
    return NextResponse.json(
      { error: t.partialSaleUnavailable },
      { status: 400 }
    );
  }

  const { images, attestation, ...rest } = parsed.data;
  const property = await prisma.property.create({
    data: {
      ...rest,
      images: images as unknown as any,
      ownerId: session.user.id,
    },
  });

  // Record each attestation clause independently.
  await recordConsentBatch({
    userId: session.user.id,
    scope: "PROPERTY_ATTESTATION",
    scopeRefId: property.id,
    clauses: [
      { key: "owner_or_agent" },
      { key: "data_accuracy" },
    ],
    request: req,
  });

  await audit({
    action: "property.create",
    resource: "property",
    resourceId: property.id,
    userId: session.user.id,
    metadata: { attestation },
    request: req,
  });

  return NextResponse.json({ property }, { status: 201 });
}
