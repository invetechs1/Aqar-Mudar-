"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Next.js requires error.tsx to be a Client Component (it's an error
 * boundary), so it cannot import next/headers-based helpers from lib/i18n.ts
 * — that would break the client bundle. The locale cookie is read directly
 * instead, with a small standalone bilingual table for this one page.
 */
const TEXT = {
  ar: {
    code: "500",
    title: "حدث خطأ غير متوقع",
    body: "نأسف على الإزعاج. يرجى المحاولة مجددًا.",
    refLabel: "ref",
    retry: "إعادة المحاولة",
    home: "الرئيسية",
  },
  en: {
    code: "500",
    title: "Something went wrong",
    body: "We're sorry for the inconvenience. Please try again.",
    refLabel: "ref",
    retry: "Try again",
    home: "Home",
  },
};

function readLocale(): "ar" | "en" {
  if (typeof document === "undefined") return "ar";
  const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
  return match?.[1] === "en" ? "en" : "ar";
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState<"ar" | "en">("ar");

  useEffect(() => {
    setLocale(readLocale());
    // eslint-disable-next-line no-console
    console.error("Route error", error);
  }, [error]);

  const t = TEXT[locale];

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="text-7xl font-black text-rose-600 mb-2">{t.code}</div>
      <h1 className="text-2xl font-bold mb-3">{t.title}</h1>
      <p className="text-slate-600 mb-2">{t.body}</p>
      {error.digest && (
        <p className="text-xs text-slate-400 font-mono mb-6">{t.refLabel}: {error.digest}</p>
      )}
      <div className="flex gap-2 justify-center">
        <button onClick={() => reset()} className="btn-primary">
          {t.retry}
        </button>
        <Link href="/" className="btn-secondary">
          {t.home}
        </Link>
      </div>
    </div>
  );
}
