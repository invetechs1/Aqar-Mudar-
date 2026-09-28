import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatSAR, PROPERTY_STATUS, PROPERTY_TYPE, vocab } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin?callbackUrl=/dashboard");

  const locale = getLocale();
  const dict = getDictionary(locale);
  const t = dict.dashboard;

  const [me, properties, inquiries] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true, role: true,
        emailVerified: true, phoneVerified: true, nafathVerified: true,
      },
    }),
    prisma.property.findMany({
      where: { ownerId: session.user.id },
      include: { report: true, _count: { select: { inquiries: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.inquiry.findMany({
      where: { property: { ownerId: session.user.id } },
      include: { property: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const stats = {
    total: properties.length,
    certified: properties.filter((p) => p.isCertified).length,
    pending: properties.filter((p) => !p.isCertified).length,
    inquiries: inquiries.length,
  };

  const kycComplete = !!(me?.emailVerified && me?.phoneVerified && me?.nafathVerified);

  return (
    <div className="mx-auto max-w-page page-x" style={{ padding: "40px 32px 80px" }}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-extrabold" style={{ fontSize: 34, letterSpacing: "-0.01em" }}>
            {t.title}
          </h1>
          <p className="mt-1 text-muted-2" style={{ fontSize: 15 }}>
            {t.welcomePrefix} {me?.name} — {t.roleLabel}: {me?.role}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/verify" className="btn-secondary rounded-full">
            {t.completeVerification}
          </Link>
          <Link href="/properties/new" className="btn-primary rounded-full">
            {t.addProperty}
          </Link>
        </div>
      </div>

      {/* Verification banner (only when KYC is incomplete) */}
      {!kycComplete && (
        <div
          className="panel-dark mb-8 flex flex-wrap items-center gap-5"
          style={{ padding: 24, borderRadius: 20 }}
        >
          <div
            className="grid place-items-center flex-none text-lg font-bold"
            style={{
              width: 40,
              height: 40,
              background: "rgba(201,162,74,.18)",
              color: "#e6c982",
              borderRadius: 12,
            }}
          >
            !
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold" style={{ fontSize: 15 }}>
              {t.kycBanner.title}
            </div>
            <div className="text-sm mt-1" style={{ color: "#b9cfc4" }}>
              {t.kycBanner.subtitle}
            </div>
          </div>
          <Link href="/dashboard/verify" className="btn-gold">
            {t.kycBanner.cta} {dict.common.arrow}
          </Link>
        </div>
      )}

      {/* Stats */}
      <div
        className="grid gap-4 mb-8"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <Stat label={t.stats.total} value={stats.total} />
        <Stat label={t.stats.certified} value={stats.certified} tone="brand" />
        <Stat label={t.stats.pending} value={stats.pending} tone="warn" />
        <Stat label={t.stats.inquiries} value={stats.inquiries} />
      </div>

      {/* Panels */}
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))" }}
      >
        <div className="card overflow-hidden">
          <div
            className="flex items-center justify-between"
            style={{ padding: "18px 24px", borderBottom: "1px solid #eef2f0" }}
          >
            <h2 className="font-bold" style={{ fontSize: 16 }}>{t.myProperties.title}</h2>
            <Link href="/properties" className="text-xs text-green-700 font-semibold">
              {t.myProperties.viewPlatform} {dict.common.arrow}
            </Link>
          </div>
          {properties.length === 0 ? (
            <div className="p-10 text-center text-muted-2 text-sm">
              {t.myProperties.empty}{" "}
              <Link href="/properties/new" className="text-green-700 font-semibold">
                {t.myProperties.addFirst}
              </Link>
            </div>
          ) : (
            <div>
              {properties.map((p) => {
                const imgs = Array.isArray(p.images) ? (p.images as string[]) : [];
                const cover = imgs[0] ?? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200";
                return (
                  <Link
                    key={p.id}
                    href={`/properties/${p.id}`}
                    className="flex items-center gap-4"
                    style={{ padding: "16px 24px", borderBottom: "1px solid #f0f3f1" }}
                  >
                    <div
                      className="flex-none overflow-hidden"
                      style={{ width: 64, height: 64, borderRadius: 12, background: "#f5f8f6" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cover} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-ink truncate" style={{ fontSize: 15 }}>
                        {p.title}
                      </div>
                      <div className="text-xs text-muted mt-1 tabular">
                        {vocab(PROPERTY_TYPE, locale, p.propertyType)} · {p.city} · {formatSAR(p.price, locale)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={p.isCertified ? "chip-ok" : "chip-warn"}>
                        {vocab(PROPERTY_STATUS, locale, p.status)}
                      </span>
                      <span className="text-xs text-muted tabular">
                        {p._count.inquiries} {t.myProperties.inquiriesSuffix}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="card overflow-hidden">
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #eef2f0" }}>
            <h2 className="font-bold" style={{ fontSize: 16 }}>{t.recentInquiries.title}</h2>
          </div>
          {inquiries.length === 0 ? (
            <div className="p-10 text-center text-muted-2 text-sm">
              {t.recentInquiries.empty}
            </div>
          ) : (
            <div>
              {inquiries.map((q) => (
                <div
                  key={q.id}
                  style={{ padding: "16px 24px", borderBottom: "1px solid #f0f3f1" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      href={`/properties/${q.property.id}`}
                      className="font-semibold text-green-700 hover:underline"
                      style={{ fontSize: 14 }}
                    >
                      {q.property.title}
                    </Link>
                    <span className="text-xs text-muted tabular">
                      {new Date(q.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-2 font-light" style={{ lineHeight: 1.7 }}>
                    {q.message}
                  </p>
                  <div className="text-xs text-muted mt-2 tabular">{q.contact}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "brand" | "warn";
}) {
  const color =
    tone === "brand"
      ? "#2f6a53"
      : tone === "warn"
      ? "#b28a35"
      : "#16211d";
  return (
    <div className="card" style={{ padding: "22px 24px" }}>
      <div className="text-xs text-muted uppercase tracking-wider">{label}</div>
      <div
        className="font-extrabold mt-2 tabular"
        style={{ fontSize: 34, letterSpacing: "-0.02em", color }}
      >
        {value}
      </div>
    </div>
  );
}
