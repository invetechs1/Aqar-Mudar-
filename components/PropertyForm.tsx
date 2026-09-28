"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ImageUploader } from "./ImageUploader";
import { LocationPicker } from "./LocationPicker";
import type { Dictionary, Locale } from "@/lib/i18n";
import { formatNumber, PROPERTY_TYPE, LISTING_TYPE, vocab } from "@/lib/format";

export function PropertyForm({ dict, locale }: { dict: Dictionary["properties"]["form"]; locale: Locale }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [attestOwner, setAttestOwner] = useState(false);
  const [attestData, setAttestData] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "",
    district: "",
    address: "",
    propertyType: "APARTMENT",
    listingType: "SALE",
    price: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    yearBuilt: "",
  });

  const STEPS = [
    { n: 1, label: dict.steps.basics },
    { n: 2, label: dict.steps.locationPhotos },
    { n: 3, label: dict.steps.review },
  ];

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!attestOwner || !attestData) {
      setError(dict.errors.consentRequired);
      return;
    }
    setError(null);
    setLoading(true);

    const payload = {
      title: form.title,
      description: form.description,
      city: form.city,
      district: form.district || undefined,
      address: form.address || undefined,
      propertyType: form.propertyType,
      listingType: form.listingType,
      price: Number(form.price),
      area: Number(form.area),
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : undefined,
      latitude: coords?.lat,
      longitude: coords?.lng,
      images,
      attestation: {
        ownerOrAgent: attestOwner,
        dataAccuracy: attestData,
      },
    };

    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/properties/${data.property.id}`);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? dict.errors.genericFail);
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Stepper */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <span
            key={s.n}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
              step === s.n ? "text-white" : "text-muted-2"
            }`}
            style={{
              background: step === s.n ? "#16302a" : "#f5f8f6",
            }}
          >
            <span
              className="grid place-items-center rounded-full text-xs"
              style={{
                width: 22,
                height: 22,
                background: step === s.n ? "#c9a24a" : "#dfe7e3",
                color: step === s.n ? "#16302a" : "#5b6863",
                fontWeight: 800,
              }}
            >
              {s.n}
            </span>
            {s.label}
            {i < STEPS.length - 1 && <span className="mx-1 text-muted">·</span>}
          </span>
        ))}
      </div>

      <form onSubmit={submit} className="card" style={{ padding: 34 }}>
        {step === 1 && (
          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">{dict.title}</label>
              <input
                className="input"
                required
                minLength={4}
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">{dict.description}</label>
              <textarea
                className="input min-h-[120px]"
                required
                minLength={20}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>

            <div>
              <label className="label">{dict.propertyType}</label>
              <select
                className="input"
                value={form.propertyType}
                onChange={(e) => update("propertyType", e.target.value)}
              >
                <option value="APARTMENT">{vocab(PROPERTY_TYPE, locale, "APARTMENT")}</option>
                <option value="VILLA">{vocab(PROPERTY_TYPE, locale, "VILLA")}</option>
                <option value="LAND">{vocab(PROPERTY_TYPE, locale, "LAND")}</option>
                <option value="COMMERCIAL">{vocab(PROPERTY_TYPE, locale, "COMMERCIAL")}</option>
                <option value="BUILDING">{vocab(PROPERTY_TYPE, locale, "BUILDING")}</option>
              </select>
            </div>

            <div>
              <label className="label">{dict.listingType}</label>
              <select
                className="input"
                value={form.listingType}
                onChange={(e) => update("listingType", e.target.value)}
              >
                <option value="SALE">{vocab(LISTING_TYPE, locale, "SALE")}</option>
                <option value="INVESTMENT">{vocab(LISTING_TYPE, locale, "INVESTMENT")}</option>
              </select>
              <p className="text-xs text-muted mt-2">
                {dict.listingNote}
              </p>
            </div>

            <div>
              <label className="label">{dict.price}</label>
              <input
                type="number"
                className="input"
                required
                min="1"
                step="1000"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
              />
            </div>
            <div>
              <label className="label">{dict.area}</label>
              <input
                type="number"
                className="input"
                required
                min="1"
                value={form.area}
                onChange={(e) => update("area", e.target.value)}
              />
            </div>
            <div>
              <label className="label">{dict.bedrooms}</label>
              <input
                type="number"
                className="input"
                min="0"
                value={form.bedrooms}
                onChange={(e) => update("bedrooms", e.target.value)}
              />
            </div>
            <div>
              <label className="label">{dict.bathrooms}</label>
              <input
                type="number"
                className="input"
                min="0"
                value={form.bathrooms}
                onChange={(e) => update("bathrooms", e.target.value)}
              />
            </div>
            <div>
              <label className="label">{dict.yearBuilt}</label>
              <input
                type="number"
                className="input"
                min="1900"
                max={new Date().getFullYear()}
                value={form.yearBuilt}
                onChange={(e) => update("yearBuilt", e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
              <div>
                <label className="label">{dict.city}</label>
                <input
                  className="input"
                  required
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </div>
              <div>
                <label className="label">{dict.district}</label>
                <input
                  className="input"
                  value={form.district}
                  onChange={(e) => update("district", e.target.value)}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="label">{dict.address}</label>
                <input
                  className="input"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">{dict.photosLabel}</label>
              <div
                style={{
                  border: "1.5px dashed #cbd8d3",
                  borderRadius: 16,
                  padding: 24,
                  background: "#fafcfb",
                }}
              >
                <ImageUploader value={images} onChange={setImages} dict={dict.uploader} />
                <p className="text-xs text-muted mt-3">
                  {dict.photosHint}
                </p>
              </div>
            </div>

            <div>
              <label className="label">{dict.mapLabel}</label>
              <LocationPicker
                onChange={(lat, lng) => setCoords({ lat, lng })}
                dict={dict.locationPicker}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold" style={{ fontSize: 20 }}>{dict.reviewTitle}</h3>
            <div
              className="grid gap-2 text-sm"
              style={{ background: "#f5f8f6", borderRadius: 14, padding: 20 }}
            >
              <Row k={dict.rows.title} v={form.title || dict.rows.empty} />
              <Row k={dict.rows.typeListing} v={`${form.propertyType} / ${form.listingType}`} />
              <Row
                k={dict.rows.price}
                v={form.price ? `${formatNumber(Number(form.price), locale)} ${locale === "ar" ? "ر.س" : "SAR"}` : dict.rows.empty}
              />
              <Row k={dict.rows.area} v={form.area ? `${form.area} ${locale === "ar" ? "م²" : "m²"}` : dict.rows.empty} />
              <Row k={dict.rows.cityDistrict} v={`${form.city || dict.rows.empty}${form.district ? ` — ${form.district}` : ""}`} />
              <Row k={dict.rows.photoCount} v={String(images.length)} />
              <Row k={dict.rows.location} v={coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : dict.rows.notSet} />
            </div>

            <div
              className="rounded-2xl"
              style={{ background: "#f5f8f6", borderRadius: 14, padding: 20 }}
            >
              <label className="flex items-start gap-3 text-sm mb-4">
                <input
                  type="checkbox"
                  checked={attestOwner}
                  onChange={(e) => setAttestOwner(e.target.checked)}
                  style={{ accentColor: "#2f6a53", marginTop: 4 }}
                />
                <span>
                  {dict.attestOwnerPrefix} <strong>{dict.attestOwnerStrong}</strong> {dict.attestOwnerSuffix}
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={attestData}
                  onChange={(e) => setAttestData(e.target.checked)}
                  style={{ accentColor: "#2f6a53", marginTop: 4 }}
                />
                <span>
                  {dict.attestDataPrefix} <strong>{dict.attestDataStrong}</strong>{dict.attestDataSuffix}
                </span>
              </label>
              <p className="text-xs text-muted mt-4">
                {dict.attestNotePrefix}{" "}
                <Link href="/legal/terms" className="underline">{dict.attestNoteLink}</Link>
              </p>
            </div>
          </div>
        )}

        {error && <div className="text-sm mt-4" style={{ color: "#b3261e" }}>{error}</div>}

        <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
          {step > 1 ? (
            <button type="button" className="btn-secondary" onClick={() => setStep((s) => (s - 1) as 1 | 2)}>
              {locale === "ar" ? `${dict.back} →` : `← ${dict.back}`}
            </button>
          ) : (
            <span />
          )}
          {step < 3 ? (
            <button type="button" className="btn-primary" onClick={() => setStep((s) => (s + 1) as 2 | 3)}>
              {locale === "ar" ? `${dict.next} ←` : `${dict.next} →`}
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !attestOwner || !attestData}
              className="btn-primary"
              style={{ opacity: !attestOwner || !attestData ? 0.5 : 1 }}
            >
              {loading ? dict.saving : dict.save}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-muted">{k}</span>
      <span className="font-semibold text-ink">{v}</span>
    </div>
  );
}
