"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { features } from "@/lib/features";
import { CITY_OPTIONS, LISTING_TYPE, PROPERTY_TYPE, vocab } from "@/lib/format";
import type { Dictionary, Locale } from "@/lib/i18n";

export function HomeSearch({ dict, locale = "ar" }: { dict: Dictionary["homeSearch"]; locale?: Locale }) {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [listing, setListing] = useState("");

  const TYPES = ["APARTMENT", "VILLA", "LAND", "COMMERCIAL", "BUILDING"].map((v) => ({
    v,
    l: vocab(PROPERTY_TYPE, locale, v),
  }));
  const LISTINGS_ALL = ["SALE", "PARTIAL_SALE", "INVESTMENT"].map((v) => ({
    v,
    l: vocab(LISTING_TYPE, locale, v),
  }));

  // Fractional-sale option is hidden until the CMA/SPV licence is in place.
  const listings = features.partialSale
    ? LISTINGS_ALL
    : LISTINGS_ALL.filter((l) => l.v !== "PARTIAL_SALE");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (city) q.set("city", city);
    if (type) q.set("type", type);
    if (listing) q.set("listing", listing);
    router.push(`/properties${q.toString() ? `?${q.toString()}` : ""}`);
  }

  const cellStyle: React.CSSProperties = {
    flex: "1 1 170px",
    minWidth: 150,
    padding: "8px 14px",
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-stretch bg-white"
      style={{
        borderRadius: 20,
        padding: 14,
        gap: 10,
        boxShadow: "0 24px 60px rgba(0,0,0,.28)",
      }}
    >
      <label style={cellStyle} className="flex-1 min-w-0 text-start">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
          {dict.city}
        </span>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full bg-transparent outline-none text-ink font-semibold"
          style={{ fontSize: 15 }}
        >
          <option value="">{dict.allCities}</option>
          {CITY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label[locale]}
            </option>
          ))}
        </select>
      </label>
      <div style={{ borderInlineEnd: "1px solid #e6eae8" }} />
      <label style={cellStyle} className="flex-1 min-w-0 text-start">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
          {dict.propertyType}
        </span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full bg-transparent outline-none text-ink font-semibold"
          style={{ fontSize: 15 }}
        >
          <option value="">{dict.allTypes}</option>
          {TYPES.map((t) => (
            <option key={t.v} value={t.v}>
              {t.l}
            </option>
          ))}
        </select>
      </label>
      <div style={{ borderInlineEnd: "1px solid #e6eae8" }} />
      <label style={cellStyle} className="flex-1 min-w-0 text-start">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
          {dict.listingType}
        </span>
        <select
          value={listing}
          onChange={(e) => setListing(e.target.value)}
          className="w-full bg-transparent outline-none text-ink font-semibold"
          style={{ fontSize: 15 }}
        >
          <option value="">{dict.all}</option>
          {listings.map((l) => (
            <option key={l.v} value={l.v}>
              {l.l}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="btn-primary"
        style={{ flex: "1 1 auto", minWidth: 160, borderRadius: 14, padding: "14px 22px" }}
      >
        {dict.search} {locale === "ar" ? "←" : "→"}
      </button>
    </form>
  );
}
