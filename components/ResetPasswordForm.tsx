"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";

export function ResetPasswordForm({ dict }: { dict: Dictionary }) {
  const t = dict.auth.resetPassword;
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError(t.errors.mismatch);
      return;
    }
    setError(null);
    setState("loading");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (res.ok) {
      setState("ok");
      setTimeout(() => router.push("/auth/signin"), 1500);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? t.errors.genericFail);
      setState("err");
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold mb-2">{t.title}</h1>
        <p className="text-slate-600 text-sm mb-6">{t.subtitle}</p>

        {state === "ok" ? (
          <div className="rounded-lg bg-brand-50 border border-brand-200 p-4 text-sm text-brand-800">
            {t.successMessage}
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">{t.newPassword}</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={10}
              />
            </div>
            <div>
              <label className="label">{t.confirmPassword}</label>
              <input
                type="password"
                className="input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-sm text-rose-600">{error}</div>}
            <button type="submit" disabled={state === "loading"} className="btn-primary w-full">
              {state === "loading" ? t.submitting : t.submit}
            </button>
          </form>
        )}

        <div className="mt-6 text-sm text-slate-600 text-center">
          <Link href="/auth/signin" className="text-brand-700 font-semibold">
            {t.backToSignin}
          </Link>
        </div>
      </div>
    </div>
  );
}
