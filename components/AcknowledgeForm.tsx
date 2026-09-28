"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";

/**
 * The eleven acknowledgement clauses are the canonical list — do not merge
 * them client-side into a single boolean. Each is submitted as its own
 * consent row. If you add or rename a clause here, mirror it in
 * lib/consent.ts `REQUIRED_CLAUSES.INVEST_ACK`, and re-prompt existing users.
 */
type Clause = {
  key: string;
  documentSlug?: "terms" | "privacy" | "disclaimer" | "risk";
  text: React.ReactNode;
};

function buildClauses(dict: Dictionary["invest"]["clauses"]): Clause[] {
  const link = (
    before: string,
    href: string,
    label: string,
    after: string
  ): React.ReactNode => (
    <>
      {before}{" "}
      <Link href={href} className="underline text-green-700">{label}</Link>
      {after}
    </>
  );

  return [
    {
      key: "read_terms",
      documentSlug: "terms",
      text: link(dict.readTerms.before, "/legal/terms", dict.readTerms.link, dict.readTerms.after),
    },
    {
      key: "read_privacy",
      documentSlug: "privacy",
      text: link(dict.readPrivacy.before, "/legal/privacy", dict.readPrivacy.link, dict.readPrivacy.after),
    },
    {
      key: "read_disclaimer",
      documentSlug: "disclaimer",
      text: link(dict.readDisclaimer.before, "/legal/disclaimer", dict.readDisclaimer.link, dict.readDisclaimer.after),
    },
    {
      key: "read_risk",
      documentSlug: "risk",
      text: link(dict.readRisk.before, "/legal/risk", dict.readRisk.link, dict.readRisk.after),
    },
    { key: "capital_loss", text: dict.capitalLoss },
    { key: "estimates_not_guaranteed", text: dict.estimatesNotGuaranteed },
    { key: "report_scope", text: dict.reportScope },
    { key: "no_platform_advice", text: dict.noPlatformAdvice },
    { key: "independent_inspection", text: dict.independentInspection },
    { key: "source_of_funds", text: dict.sourceOfFunds },
    { key: "electronic_logging", text: dict.electronicLogging },
  ];
}

export function AcknowledgeForm({
  propertyId,
  dict,
}: {
  propertyId: string;
  dict: Dictionary["invest"];
}) {
  const t = dict.acknowledge;
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CLAUSES = buildClauses(dict.clauses);
  const allChecked = CLAUSES.every((c) => checked[c.key]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!allChecked) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/consent/invest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        propertyId,
        clauses: CLAUSES.map((c) => ({ key: c.key, documentSlug: c.documentSlug })),
      }),
    });
    if (res.ok) {
      router.push(`/properties/${propertyId}/invest`);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? t.errors.genericFail);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6">
      <div>
        {CLAUSES.map((c, i) => (
          <label
            key={c.key}
            className="flex items-start gap-3"
            style={{
              padding: "16px 0",
              borderTop: i === 0 ? "none" : "1px solid #f2f5f4",
              fontSize: 14,
              lineHeight: 1.9,
            }}
          >
            <input
              type="checkbox"
              checked={!!checked[c.key]}
              onChange={(e) =>
                setChecked((s) => ({ ...s, [c.key]: e.target.checked }))
              }
              style={{ accentColor: "#2f6a53", width: 19, height: 19, marginTop: 3, flex: "none" }}
            />
            <span className="text-muted-2">{c.text}</span>
          </label>
        ))}
      </div>

      {error && <div className="text-sm mt-3" style={{ color: "#b3261e" }}>{error}</div>}

      <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
        <Link href={`/properties/${propertyId}`} className="btn-secondary">
          {t.cancel}
        </Link>
        <button
          type="submit"
          disabled={!allChecked || busy}
          className="btn-primary"
          style={{ opacity: allChecked ? 1 : 0.5 }}
        >
          {busy ? t.submitting : t.submit}
        </button>
      </div>
      <p className="text-xs text-muted mt-4">
        {t.footerNote}
      </p>
    </form>
  );
}
