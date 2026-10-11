import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seeds four demo accounts with a known-weak password ("Password123!"), which
 * is only acceptable for local development and CI. Refuse to run against a
 * production environment unless the operator opts in with ALLOW_PRODUCTION_SEED=yes,
 * so a stray `npm run db:seed` on the production DB can't plant a known-password
 * admin account.
 */
function guardProductionSeed(): void {
  if (process.env.NODE_ENV !== "production") return;
  if (process.env.ALLOW_PRODUCTION_SEED === "yes") {
    console.warn(
      "⚠️  ALLOW_PRODUCTION_SEED=yes — writing demo accounts to a production DB. " +
      "Change their passwords immediately after this run."
    );
    return;
  }
  console.error(
    "✗ Refusing to seed demo accounts against NODE_ENV=production.\n" +
    "  The seed creates `admin@aqarmudar.sa` with a known password — this would be\n" +
    "  a critical security hole on a live system. If you really intend to run this\n" +
    "  on production (e.g. a staging DB tagged as production), re-run with:\n" +
    "    ALLOW_PRODUCTION_SEED=yes npm run db:seed"
  );
  process.exit(1);
}

async function main() {
  guardProductionSeed();

  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@aqarmudar.sa" },
    update: {},
    create: {
      email: "admin@aqarmudar.sa",
      passwordHash,
      name: "مدير النظام",
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@aqarmudar.sa" },
    update: {},
    create: {
      email: "owner@aqarmudar.sa",
      passwordHash,
      name: "مالك تجريبي",
      phone: "+966500000001",
      role: "OWNER",
      emailVerified: new Date(),
      phoneVerified: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: "investor@aqarmudar.sa" },
    update: {},
    create: {
      email: "investor@aqarmudar.sa",
      passwordHash,
      name: "مستثمر تجريبي",
      phone: "+966500000002",
      role: "INVESTOR",
      emailVerified: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: "engineer@aqarmudar.sa" },
    update: {},
    create: {
      email: "engineer@aqarmudar.sa",
      passwordHash,
      name: "مهندس معتمد",
      role: "ENGINEER",
      emailVerified: new Date(),
    },
  });

  await prisma.property.deleteMany({ where: { ownerId: owner.id } });

  const properties = [
    {
      title: "فيلا فاخرة في حي الياسمين",
      description:
        "فيلا حديثة بتشطيبات راقية ومساحات واسعة، تقع في موقع استراتيجي قريب من الخدمات الرئيسية. مناسبة للسكن أو الاستثمار.",
      city: "الرياض",
      district: "حي الياسمين",
      propertyType: "VILLA" as const,
      listingType: "SALE" as const,
      price: 3200000,
      area: 480,
      bedrooms: 6,
      bathrooms: 7,
      yearBuilt: 2019,
      latitude: 24.8247,
      longitude: 46.6296,
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
      ],
      report: {
        structuralCondition: "EXCELLENT" as const,
        finishingQuality: "GOOD" as const,
        electricalCondition: "EXCELLENT" as const,
        mechanicalCondition: "GOOD" as const,
        riskLevel: "LOW" as const,
        estimatedLifespan: 45,
        valueUpliftPotential: 12,
        upliftScope: "تحديث المطبخ وتجديد الحدائق الخارجية",
        upliftCost: 180000,
        upliftDurationMonths: 3,
        expectedReturnPct: 18,
        recommendations:
          "العقار في حالة ممتازة. يُنصح بتحديث بسيط للمطبخ لرفع القيمة السوقية بنسبة تصل إلى 12%.",
      },
    },
    {
      title: "شقة استثمارية في حي العليا (بيع جزئي)",
      description:
        "شقة في برج حديث بموقع مميز، مؤجرة حاليًا بعائد سنوي جيد. متاحة عبر البيع الجزئي — استثمر بأي حصة تناسبك.",
      city: "الرياض",
      district: "حي العليا",
      propertyType: "APARTMENT" as const,
      listingType: "PARTIAL_SALE" as const,
      price: 950000,
      area: 145,
      bedrooms: 3,
      bathrooms: 2,
      yearBuilt: 2021,
      latitude: 24.6947,
      longitude: 46.6836,
      totalShares: 950,
      sharePriceSAR: 1000,
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
      ],
      report: {
        structuralCondition: "EXCELLENT" as const,
        finishingQuality: "EXCELLENT" as const,
        electricalCondition: "EXCELLENT" as const,
        mechanicalCondition: "EXCELLENT" as const,
        riskLevel: "LOW" as const,
        estimatedLifespan: 50,
        valueUpliftPotential: 5,
        recommendations: "لا توجد ملاحظات هندسية. العقار جاهز للسكن أو التأجير.",
      },
    },
    {
      title: "مبنى تجاري في جدة - فرصة تطوير",
      description:
        "مبنى تجاري بحاجة إلى ترميم وتطوير. موقع ذهبي على شارع رئيسي. عائد متوقع مرتفع بعد التطوير.",
      city: "جدة",
      district: "حي الروضة",
      propertyType: "BUILDING" as const,
      listingType: "SALE" as const,
      price: 5800000,
      area: 720,
      yearBuilt: 2005,
      latitude: 21.5936,
      longitude: 39.1728,
      images: [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200",
      ],
      report: {
        structuralCondition: "FAIR" as const,
        finishingQuality: "POOR" as const,
        electricalCondition: "FAIR" as const,
        mechanicalCondition: "POOR" as const,
        riskLevel: "MEDIUM" as const,
        estimatedLifespan: 25,
        valueUpliftPotential: 35,
        upliftScope:
          "تجديد الواجهة الخارجية، استبدال أنظمة التكييف، تحديث الأنظمة الكهربائية، تجديد التشطيبات الداخلية.",
        upliftCost: 1200000,
        upliftDurationMonths: 8,
        expectedReturnPct: 42,
        recommendations:
          "فرصة تطوير قوية. الاستثمار في التجديد قد يرفع القيمة بنسبة 35%.",
      },
    },
  ];

  for (const p of properties) {
    const { report, ...propertyData } = p;
    await prisma.property.create({
      data: {
        ...propertyData,
        ownerId: owner.id,
        status: "CERTIFIED",
        isCertified: true,
        report: { create: report },
      },
    });
  }

  console.log("\n✓ Seed complete.");
  console.log("  admin@aqarmudar.sa / Password123!");
  console.log("  owner@aqarmudar.sa / Password123!");
  console.log("  investor@aqarmudar.sa / Password123!");
  console.log("  engineer@aqarmudar.sa / Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
