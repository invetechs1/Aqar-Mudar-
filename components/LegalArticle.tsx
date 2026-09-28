import Link from "next/link";
import type { LegalDoc } from "@/lib/legal-docs";
import { getDocumentVersion } from "@/lib/legal-docs";
import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * Shared legal article renderer.
 *
 * The draft banner is intentional — the copy in `lib/legal-docs.ts` is a
 * pre-launch draft that must be reviewed by a licensed Saudi lawyer. Remove
 * the banner from THIS component (not per-page) once each document is
 * approved. `version` and dates are read from the content module so a
 * lawyer's edits don't need a code change.
 *
 * The English text is a convenience translation of the Arabic original —
 * standard practice for a bilingual legal document. The Arabic version
 * remains authoritative in case of conflict; that notice is shown only in
 * English (a native Arabic reader doesn't need it).
 */
export function LegalArticle({
  doc,
  dict,
  locale,
}: {
  doc: LegalDoc;
  dict: Dictionary["legal"];
  locale: Locale;
}) {
  const version = getDocumentVersion(doc.slug);
  const b = dict.draftBanner;

  return (
    <div style={{ maxWidth: 780 }}>
      <div className="legal-block mb-6">
        <h4>{b.title}</h4>
        <p>
          {b.before} <strong>REGA</strong>{b.and1}<strong>CMA</strong>{b.and2}<strong>PDPL</strong>{b.and3}{" "}
          <strong>SDAIA</strong>{b.and4} <strong>ZATCA</strong>{b.end}
        </p>
      </div>

      {locale === "en" && (
        <div className="legal-block mb-6">
          <p>
            This is a convenience translation of the original Arabic document. In the event of any
            conflict or inconsistency between the two versions, the Arabic version shall prevail.
          </p>
        </div>
      )}

      <div className="text-xs uppercase tracking-widest text-muted">{doc.eyebrow}</div>
      <h1 className="font-extrabold mt-2" style={{ fontSize: 40, letterSpacing: "-0.01em" }}>
        {doc.title}
      </h1>
      <p className="mt-4 font-light text-muted-2" style={{ fontSize: 17, lineHeight: 1.9 }}>
        {doc.intro}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <MetaChip label={dict.meta.version} value={version} />
        <MetaChip label={dict.meta.lastUpdated} value={version} />
        <MetaChip label={dict.meta.governingLaw} value={dict.meta.governingLawValue} />
      </div>

      <hr className="my-8" style={{ border: 0, borderTop: "1px solid #e6eae8" }} />

      <div className="space-y-9">
        {doc.sections.map((s, i) => (
          <section key={s.heading}>
            <h2 className="font-bold" style={{ fontSize: 22 }}>
              <span
                className="tabular me-3"
                style={{ color: "#c9a24a", fontWeight: 700 }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.heading}
            </h2>
            <div className="mt-4 space-y-4">
              {s.paragraphs?.map((p, j) => (
                <p key={j} className="font-light text-muted-2" style={{ fontSize: 15, lineHeight: 1.95 }}>
                  {p}
                </p>
              ))}
              {s.bullets && (
                <ul className="space-y-3">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <span className="flex-none" style={{ color: "#c9a24a", fontWeight: 700, marginTop: 2 }}>
                        —
                      </span>
                      <span className="font-light text-muted-2" style={{ fontSize: 15, lineHeight: 1.95 }}>
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>

      {doc.closing && (
        <div
          className="mt-12"
          style={{ background: "#f5f8f6", borderRadius: 20, padding: 26 }}
        >
          <h3 className="font-bold" style={{ fontSize: 18 }}>{doc.closing.heading}</h3>
          {doc.closing.paragraphs.map((p, i) => (
            <p key={i} className="font-light text-muted-2 mt-3" style={{ fontSize: 14, lineHeight: 1.9 }}>
              {p}
            </p>
          ))}
        </div>
      )}

      <div className="mt-8 text-sm">
        <Link href="/contact" className="text-green-700 font-semibold hover:underline">
          {dict.contactCta} {locale === "ar" ? "←" : "→"}
        </Link>
      </div>
    </div>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <span
      className="chip-muted"
      style={{ fontSize: 12, gap: 6 }}
    >
      <span className="text-muted">{label}:</span>
      <span className="font-semibold text-ink tabular">{value}</span>
    </span>
  );
}
