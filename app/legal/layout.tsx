import Link from "next/link";
import { LEGAL_ROUTES } from "@/lib/legal-docs";
import { getDictionary, getLocale } from "@/lib/i18n";

export const metadata = { title: "Legal Center" };

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  const dict = getDictionary(locale);
  const routes = LEGAL_ROUTES[locale];

  return (
    <div className="mx-auto max-w-page page-x" style={{ padding: "40px 32px 80px" }}>
      <div
        className="flex flex-wrap"
        style={{ gap: 32 }}
      >
        <aside style={{ flex: "1 1 260px", position: "sticky", top: 96, alignSelf: "flex-start" }}>
          <div
            style={{
              background: "#f5f8f6",
              borderRadius: 20,
              padding: 22,
            }}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-muted mb-4">
              {dict.legal.sidebarDocsLabel}
            </div>
            <nav aria-label="legal">
              <ul className="space-y-1">
                {routes.map((r) => (
                  <li key={r.slug}>
                    <LegalNavLink href={r.href} label={r.label} />
                  </li>
                ))}
              </ul>
            </nav>
            <div
              className="text-xs text-muted-2 mt-5 pt-5 tabular"
              style={{ lineHeight: 1.9, borderTop: "1px solid #e2e9e6" }}
            >
              {dict.footer.companyLine1}
              <br />
              {dict.footer.companyLine2}
            </div>
          </div>
        </aside>

        <article
          style={{
            flex: "3 1 620px",
            minWidth: 0,
          }}
        >
          {children}
        </article>
      </div>
    </div>
  );
}

function LegalNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-xl transition"
      style={{
        padding: "12px 14px",
        fontSize: 14,
        color: "#5b6863",
        fontWeight: 500,
        textAlign: "start",
      }}
    >
      {label}
    </Link>
  );
}
