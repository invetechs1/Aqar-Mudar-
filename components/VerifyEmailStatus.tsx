"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";

export function VerifyEmailStatus({ dict }: { dict: Dictionary }) {
  const t = dict.auth.verifyEmail;
  const sp = useSearchParams();
  const token = sp.get("token");
  const [state, setState] = useState<"loading" | "ok" | "err">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState("err");
      setError(t.errors.missingToken);
      return;
    }
    (async () => {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) setState("ok");
      else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? t.errors.genericFail);
        setState("err");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8 text-center">
        {state === "loading" && <div className="text-slate-600">{t.verifying}</div>}
        {state === "ok" && (
          <>
            <div className="text-5xl mb-3">✓</div>
            <h1 className="text-2xl font-bold mb-2">{t.successTitle}</h1>
            <p className="text-slate-600 mb-6">{t.successMessage}</p>
            <Link href="/dashboard" className="btn-primary">
              {t.goToDashboard}
            </Link>
          </>
        )}
        {state === "err" && (
          <>
            <div className="text-5xl mb-3">✗</div>
            <h1 className="text-2xl font-bold mb-2">{t.failTitle}</h1>
            <p className="text-rose-600 mb-6">{error}</p>
            <Link href="/dashboard" className="btn-secondary">
              {t.back}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
