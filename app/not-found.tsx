import Link from "next/link";
import { getDictionary } from "@/lib/i18n";

export default function NotFound() {
  const dict = getDictionary();
  const t = dict.notFound;

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="text-7xl font-black text-brand-700 mb-2">{t.code}</div>
      <h1 className="text-2xl font-bold mb-3">{t.title}</h1>
      <p className="text-slate-600 mb-6">{t.body}</p>
      <div className="flex gap-2 justify-center">
        <Link href="/" className="btn-primary">
          {t.home}
        </Link>
        <Link href="/properties" className="btn-secondary">
          {t.properties}
        </Link>
      </div>
    </div>
  );
}
