import { JsonLd } from "@/components/JsonLd";
import { getDictionary } from "@/lib/i18n";

export const metadata = { title: "Frequently asked questions" };

export default function FAQPage() {
  const dict = getDictionary();
  const t = dict.faq;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <JsonLd data={jsonLd} />
      <h1 className="text-3xl font-bold mb-8">{t.title}</h1>
      <div className="space-y-3">
        {t.items.map((f, i) => (
          <details key={i} className="card p-5 group">
            <summary className="font-semibold cursor-pointer flex items-center justify-between">
              <span>{f.q}</span>
              <span className="text-brand-600 group-open:rotate-45 transition">+</span>
            </summary>
            <p className="mt-3 text-slate-600 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
