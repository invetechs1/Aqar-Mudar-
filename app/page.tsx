import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/PropertyCard";
import { getDictionary, getLocale } from "@/lib/i18n";
import { HomeSearch } from "@/components/HomeSearch";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const locale = getLocale();
  const dict = getDictionary(locale);
  const featured = await prisma.property.findMany({
    where: { isCertified: true },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      {/* HERO */}
      <section style={{ background: "#16302a" }} className="text-white">
        <div
          className="mx-auto max-w-page text-center"
          style={{ padding: "76px 32px 130px" }}
        >
          <span
            className="inline-flex items-center gap-2 rounded-full text-xs font-semibold"
            style={{
              background: "rgba(201,162,74,.16)",
              border: "1px solid rgba(201,162,74,.4)",
              color: "#e6c982",
              padding: "6px 16px",
            }}
          >
            <span>✓</span>
            {dict.hero.badge}
          </span>

          <h1
            className="mx-auto mt-6 font-extrabold"
            style={{
              maxWidth: 900,
              fontSize: "clamp(38px, 5.5vw, 62px)",
              lineHeight: 1.22,
              letterSpacing: "-0.01em",
            }}
          >
            {dict.hero.titleA}
            <br />
            <span style={{ color: "#c9a24a" }}>{dict.hero.titleB}</span>
          </h1>

          <p
            className="mx-auto mt-6 font-light"
            style={{
              maxWidth: 720,
              color: "#b9cfc4",
              fontSize: 18,
              lineHeight: 1.9,
            }}
          >
            {dict.hero.subtitle}
          </p>

          {/* Hero search card */}
          <div className="mx-auto mt-10" style={{ maxWidth: 900 }}>
            <HomeSearch dict={dict.homeSearch} locale={locale} />
          </div>

          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm"
            style={{ color: "#93b3a4" }}
          >
            <Link
              href="/properties"
              className="hover:underline"
              style={{ color: "#e6c982" }}
            >
              {dict.hero.ctaBrowse} {dict.common.arrow}
            </Link>
            <span>·</span>
            <Link
              href="/auth/signup"
              className="hover:underline"
              style={{ color: "#e6c982" }}
            >
              {dict.hero.ctaOwner} {dict.common.arrow}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip — pulled up */}
      <div className="mx-auto max-w-page page-x">
        <div
          className="card grid text-center"
          style={{
            marginTop: -68,
            gridTemplateColumns: "repeat(3, 1fr)",
            padding: "26px 24px",
            position: "relative",
            zIndex: 2,
          }}
        >
          {[
            { v: "100%", l: dict.hero.stats.inspected },
            { v: "+30", l: dict.hero.stats.indicators },
            { v: "AR / EN", l: dict.hero.stats.bilingual },
          ].map((s, i) => (
            <div
              key={s.l}
              className="px-4"
              style={{ borderInlineEnd: i < 2 ? "1px solid #e6eae8" : "none" }}
            >
              <div
                className="font-extrabold tabular"
                style={{ fontSize: 38, color: "#2f6a53", letterSpacing: "-0.02em" }}
              >
                {s.v}
              </div>
              <div className="text-xs text-muted mt-2 uppercase tracking-wider">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="certified" className="mx-auto max-w-page page-x" style={{ padding: "92px 32px" }}>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-extrabold" style={{ fontSize: 42, letterSpacing: "-0.01em" }}>
            {dict.features.title}
          </h2>
          <p className="mt-4 text-muted-2 font-light" style={{ fontSize: 17, lineHeight: 1.9 }}>
            {dict.features.subtitle}
          </p>
        </div>
        <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {dict.features.items.map((f) => (
            <div
              key={f.t}
              style={{ background: "#f5f8f6", borderRadius: 20, padding: "38px 32px" }}
            >
              <div
                className="rounded-2xl bg-white grid place-items-center mb-5"
                style={{ width: 52, height: 52, fontSize: 24 }}
              >
                {f.i}
              </div>
              <h3 className="font-bold text-lg mb-3">{f.t}</h3>
              <p className="text-muted-2 font-light" style={{ fontSize: 15, lineHeight: 1.9 }}>
                {f.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      {featured.length > 0 && (
        <section style={{ background: "#f5f8f6" }}>
          <div
            className="mx-auto max-w-page page-x"
            style={{ padding: "92px 32px" }}
          >
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="font-extrabold" style={{ fontSize: 42, letterSpacing: "-0.01em" }}>
                  {dict.featured.title}
                </h2>
                <p className="mt-3 text-muted-2 font-light" style={{ fontSize: 17 }}>
                  {dict.featured.subtitle}
                </p>
              </div>
              <Link href="/properties" className="btn-secondary rounded-full">
                {dict.featured.viewAll} {dict.common.arrow}
              </Link>
            </div>
            <div
              className="grid gap-6"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))" }}
            >
              {featured.map((p) => (
                <PropertyCard key={p.id} property={p} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AUDIENCES */}
      <section
        id="about"
        className="mx-auto max-w-page page-x"
        style={{ padding: "92px 32px" }}
      >
        <h2
          className="text-center font-extrabold mb-12"
          style={{ fontSize: 42, letterSpacing: "-0.01em" }}
        >
          {dict.audiences.title}
        </h2>
        <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {dict.audiences.groups.map((a) => (
            <div
              key={a.t}
              className="card"
              style={{ padding: 32, boxShadow: "none" }}
            >
              <h3
                className="font-bold mb-5"
                style={{ color: "#2f6a53", fontSize: 20 }}
              >
                {a.t}
              </h3>
              <ul className="space-y-3">
                {a.items.map((it) => (
                  <li key={it} className="flex items-start gap-3 text-muted-2" style={{ fontSize: 15 }}>
                    <span style={{ color: "#c9a24a", fontWeight: 700 }}>✓</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-page page-x" style={{ paddingBottom: 92 }}>
        <div
          className="panel-dark"
          style={{ padding: "66px 60px" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="min-w-0 flex-1" style={{ minWidth: 260 }}>
              <h2
                className="font-extrabold"
                style={{ fontSize: 34, letterSpacing: "-0.01em" }}
              >
                {dict.cta.title}
              </h2>
              <p className="mt-3" style={{ color: "#b9cfc4", fontSize: 16, lineHeight: 1.85 }}>
                {dict.cta.subtitle}
              </p>
            </div>
            <Link href="/auth/signup" className="btn-gold">
              {dict.cta.button} {dict.common.arrow}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
