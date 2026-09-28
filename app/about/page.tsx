import { getDictionary } from "@/lib/i18n";

export const metadata = { title: "About Aqar Mudar" };

export default function AboutPage() {
  const dict = getDictionary();
  const t = dict.about;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-4">{t.title}</h1>
      <p className="text-lg text-slate-600 leading-relaxed mb-8">
        {t.intro}
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="card p-6">
          <h2 className="font-bold text-xl mb-2">{t.visionTitle}</h2>
          <p className="text-slate-600">{t.visionBody}</p>
        </div>
        <div className="card p-6">
          <h2 className="font-bold text-xl mb-2">{t.valuesTitle}</h2>
          <ul className="text-slate-600 space-y-1">
            {t.values.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">{t.partnersTitle}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {t.partners.map((p) => (
          <div key={p.n} className="card p-5">
            <div className="font-bold mb-1">{p.n}</div>
            <div className="text-sm text-slate-600">{p.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
