import { getDictionary } from "@/lib/i18n";

export const metadata = { title: "Contact us" };

export default function ContactPage() {
  const dict = getDictionary();
  const t = dict.contact;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
      <p className="text-slate-600 mb-8">{t.subtitle}</p>
      <div className="grid gap-4">
        {t.channels.map((c) => (
          <div key={c.e} className="card p-5 flex items-center justify-between">
            <div>
              <div className="font-semibold">{c.t}</div>
              <div className="text-sm text-slate-500 mt-1">{c.e}</div>
            </div>
            <a href={`mailto:${c.e}`} className="btn-secondary">
              {t.emailUs}
            </a>
          </div>
        ))}
      </div>
      <div className="card p-5 mt-6 text-sm text-slate-600">
        <div className="font-semibold text-slate-900 mb-1">{t.addressTitle}</div>
        {t.addressValue}
      </div>
    </div>
  );
}
