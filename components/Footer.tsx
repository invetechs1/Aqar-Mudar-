import Link from "next/link";
import { LogoSignature } from "./Logo";
import type { Dictionary } from "@/lib/i18n";

const PARTNERS = [
  "Alarrab Engineering & Partner",
  "Azoom United Contracting",
  "First Ex",
  "Bassir Technology",
];

export function Footer({ dict }: { dict: Dictionary }) {
  const f = dict.footer;

  const legalLinks: { href: string; label: string }[] = [
    { href: "/legal/terms", label: dict.legal.routes.terms },
    { href: "/legal/privacy", label: dict.legal.routes.privacy },
    { href: "/legal/disclaimer", label: dict.legal.routes.disclaimer },
    { href: "/legal/risk", label: dict.legal.routes.risk },
    { href: "/legal/aml", label: dict.legal.routes.aml },
    { href: "/legal/refund", label: dict.legal.routes.refund },
  ];

  const platformLinks: { href: string; label: string }[] = [
    { href: "/properties", label: f.links.properties },
    { href: "/#certified", label: f.links.certified },
    { href: "/faq", label: f.links.faq },
    { href: "/contact", label: f.links.contact },
  ];

  return (
    <footer style={{ background: "#f5f8f6" }} className="mt-16 border-t border-line">
      <div
        className="mx-auto max-w-page grid gap-10 text-sm"
        style={{
          padding: "56px 32px 32px",
          gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
        }}
      >
        <div className="min-w-0">
          <LogoSignature on="light" size={40} href={null} />
          <p className="mt-4 text-muted-2 leading-relaxed" style={{ maxWidth: 320 }}>
            {f.tag}
          </p>
          <p className="mt-4 text-xs text-muted tabular" style={{ lineHeight: 1.9 }}>
            {f.companyLine1}
            <br />
            {f.companyLine2}
          </p>
        </div>

        <div>
          <div className="font-bold text-ink mb-3">{f.platform}</div>
          <ul className="space-y-2 text-muted-2">
            {platformLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-green-700 transition">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-bold text-ink mb-3">{f.partners}</div>
          <ul className="space-y-2 text-muted-2">
            {PARTNERS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-bold text-ink mb-3">{f.legal}</div>
          <ul className="space-y-2 text-muted-2">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-green-700 transition">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="font-bold text-ink mt-6 mb-2">{f.contact}</div>
          <div className="text-muted-2 text-xs" style={{ lineHeight: 1.9 }}>
            info@aqarmudar.sa
            <br />
            legal@aqarmudar.sa
          </div>
        </div>
      </div>

      <div
        className="border-t border-line text-center text-xs text-muted"
        style={{ padding: "18px 32px" }}
      >
        © {new Date().getFullYear()} {f.copyright}
      </div>
    </footer>
  );
}
