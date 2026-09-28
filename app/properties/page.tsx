import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/PropertyCard";
import { features } from "@/lib/features";
import { getDictionary, getLocale } from "@/lib/i18n";
import { CITY_OPTIONS, LISTING_TYPE, PROPERTY_TYPE, vocab } from "@/lib/format";

export const dynamic = "force-dynamic";

type Search = {
  city?: string;
  type?: string;
  listing?: string;
  certified?: string;
  sort?: string;
};

export default async function PropertiesPage({ searchParams }: { searchParams: Search }) {
  const locale = getLocale();
  const dict = getDictionary(locale);
  const t = dict.properties.list;

  const TYPE_OPTIONS = ["APARTMENT", "VILLA", "LAND", "COMMERCIAL", "BUILDING"].map((v) => ({
    v,
    l: vocab(PROPERTY_TYPE, locale, v),
  }));
  const LISTING_OPTIONS_ALL = ["SALE", "PARTIAL_SALE", "INVESTMENT"].map((v) => ({
    v,
    l: vocab(LISTING_TYPE, locale, v),
  }));

  const listingOptions = features.partialSale
    ? LISTING_OPTIONS_ALL
    : LISTING_OPTIONS_ALL.filter((l) => l.v !== "PARTIAL_SALE");

  // Enforce the feature flag on any deep-linked query string too.
  const effectiveListing =
    !features.partialSale && searchParams.listing === "PARTIAL_SALE"
      ? undefined
      : searchParams.listing;

  // Keep partial-sale listings visible; the sidebar CTA switches to a
  // "coming soon" state via features.partialSale. Only the filter option is hidden.
  const where = {
    ...(searchParams.city && { city: searchParams.city }),
    ...(searchParams.type && { propertyType: searchParams.type as any }),
    ...(effectiveListing && { listingType: effectiveListing as any }),
    ...(searchParams.certified === "1" && { isCertified: true }),
  };

  const properties = await prisma.property.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const activeFilters: { key: keyof Search; label: string; value: string }[] = [];
  if (searchParams.city) {
    const c = CITY_OPTIONS.find((x) => x.value === searchParams.city);
    activeFilters.push({ key: "city", label: t.activeFilters.city, value: c ? c.label[locale] : searchParams.city });
  }
  if (searchParams.type) {
    const ty = TYPE_OPTIONS.find((x) => x.v === searchParams.type);
    if (ty) activeFilters.push({ key: "type", label: t.activeFilters.type, value: ty.l });
  }
  if (effectiveListing) {
    const l = LISTING_OPTIONS_ALL.find((x) => x.v === effectiveListing);
    if (l) activeFilters.push({ key: "listing", label: t.activeFilters.listing, value: l.l });
  }
  if (searchParams.certified === "1") {
    activeFilters.push({ key: "certified", label: t.activeFilters.certifiedLabel, value: t.activeFilters.certifiedValue });
  }

  return (
    <div className="mx-auto max-w-page page-x" style={{ padding: "40px 32px 80px" }}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-extrabold" style={{ fontSize: 38, letterSpacing: "-0.01em" }}>
            {t.title}
          </h1>
          <p className="mt-2 text-muted-2" style={{ fontSize: 15 }}>
            {properties.length} {t.countSuffix}{" "}
            {searchParams.certified === "1" ? t.certifiedSuffix : ""}
          </p>
        </div>
        <Link href="/properties/new" className="btn-primary rounded-full">
          {t.addProperty}
        </Link>
      </div>

      {/* Filter bar */}
      <form
        className="card flex flex-wrap items-end"
        style={{ padding: 12, gap: 10, borderRadius: 18 }}
        method="get"
      >
        <label style={{ flex: "1 1 150px", minWidth: 130 }} className="text-start">
          <span className="label">{t.filters.city}</span>
          <select name="city" defaultValue={searchParams.city ?? ""} className="input">
            <option value="">{t.filters.allCities}</option>
            {CITY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label[locale]}
              </option>
            ))}
          </select>
        </label>

        <label style={{ flex: "1 1 150px", minWidth: 130 }} className="text-start">
          <span className="label">{t.filters.type}</span>
          <select name="type" defaultValue={searchParams.type ?? ""} className="input">
            <option value="">{t.filters.allTypes}</option>
            {TYPE_OPTIONS.map((ty) => (
              <option key={ty.v} value={ty.v}>
                {ty.l}
              </option>
            ))}
          </select>
        </label>

        <label style={{ flex: "1 1 150px", minWidth: 130 }} className="text-start">
          <span className="label">{t.filters.listing}</span>
          <select name="listing" defaultValue={effectiveListing ?? ""} className="input">
            <option value="">{t.filters.all}</option>
            {listingOptions.map((l) => (
              <option key={l.v} value={l.v}>
                {l.l}
              </option>
            ))}
          </select>
        </label>

        <label
          className="flex items-center gap-2 text-sm"
          style={{ flex: "1 1 auto", padding: "16px 8px" }}
        >
          <input
            type="checkbox"
            name="certified"
            value="1"
            defaultChecked={searchParams.certified === "1"}
            className="w-4 h-4"
            style={{ accentColor: "#2f6a53" }}
          />
          {t.filters.certifiedOnly}
        </label>

        <button className="btn-dark" type="submit" style={{ borderRadius: 12 }}>
          {t.filters.apply}
        </button>
      </form>

      {(activeFilters.length > 0) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeFilters.map((f) => (
            <span
              key={f.key}
              className={f.key === "certified" ? "chip-certified" : "chip-muted"}
              style={{ fontSize: 12 }}
            >
              {f.label}: {f.value}
            </span>
          ))}
          <Link href="/properties" className="text-xs text-muted-2 underline">
            {t.activeFilters.clearAll}
          </Link>
          <span className="ms-auto text-xs text-muted">{t.activeFilters.sortNewest}</span>
        </div>
      )}

      <div
        className="grid gap-6 mt-8"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))" }}
      >
        {properties.length === 0 ? (
          <div className="card p-10 text-center text-muted-2 col-span-full">
            {t.empty}
          </div>
        ) : (
          properties.map((p) => <PropertyCard key={p.id} property={p} locale={locale} />)
        )}
      </div>
    </div>
  );
}
