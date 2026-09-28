"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { AuthSplitLayout } from "@/components/AuthSplitLayout";
import type { Dictionary } from "@/lib/i18n";

export function SignInForm({ dict }: { dict: Dictionary }) {
  const t = dict.auth.signin;
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [needsTotp, setNeedsTotp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      totp: totp || undefined,
      redirect: false,
    });
    if (res?.ok) {
      router.push(callbackUrl);
      router.refresh();
    } else if (res?.error === "TOTP_REQUIRED") {
      setNeedsTotp(true);
      setError(t.errors.totpRequired);
      setLoading(false);
    } else if (res?.error === "TOTP_INVALID") {
      setError(t.errors.totpInvalid);
      setLoading(false);
    } else {
      setError(t.errors.invalidCredentials);
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout headline={t.headline} sub={t.sub} points={[...t.points]}>
      <h1 className="font-extrabold" style={{ fontSize: 30, letterSpacing: "-0.01em" }}>
        {t.title}
      </h1>
      <p className="mt-2 text-muted-2" style={{ fontSize: 14 }}>
        {t.subtitle}
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label">{t.email}</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="label">{t.password}</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {needsTotp && (
          <div>
            <label className="label">{t.totpLabel}</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              className="input tabular tracking-widest text-center"
              value={totp}
              onChange={(e) => setTotp(e.target.value)}
              autoFocus
            />
          </div>
        )}
        {error && <div className="text-sm" style={{ color: "#b3261e" }}>{error}</div>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? t.submitting : t.submit}
        </button>
      </form>

      <div className="mt-4 text-sm text-center">
        <Link href="/auth/forgot-password" className="text-muted hover:text-green-700">
          {t.forgotPassword}
        </Link>
      </div>

      <div className="mt-6 text-sm text-muted-2 text-center">
        {t.noAccount}{" "}
        <Link href="/auth/signup" className="text-green-700 font-semibold">
          {t.createAccount}
        </Link>
      </div>

      <div
        className="mt-6 rounded-xl text-xs"
        style={{ background: "#f5f8f6", border: "1px solid #e6eae8", padding: 12, color: "#5b6863" }}
      >
        <div className="font-semibold mb-1 text-ink">{t.demoAccountsLabel}</div>
        <div>admin@aqarmudar.sa / Password123!</div>
        <div>owner@aqarmudar.sa / Password123!</div>
        <div>investor@aqarmudar.sa / Password123!</div>
      </div>
    </AuthSplitLayout>
  );
}
