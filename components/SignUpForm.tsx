"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { AuthSplitLayout } from "@/components/AuthSplitLayout";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import type { Dictionary } from "@/lib/i18n";

export function SignUpForm({ dict }: { dict: Dictionary }) {
  const t = dict.auth.signup;
  const ROLES: { v: string; label: string }[] = [
    { v: "OWNER", label: t.roles.owner },
    { v: "INVESTOR", label: t.roles.investor },
    { v: "DEVELOPER", label: t.roles.developer },
  ];

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState("OWNER");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consent) {
      setError(t.errors.consentRequired);
      return;
    }
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    // "DEVELOPER" is mapped to OWNER on the API — the design surfaces it as an
    // intent/label, but we only carry OWNER/INVESTOR/ADMIN in the DB today.
    const apiRole = role === "INVESTOR" ? "INVESTOR" : "OWNER";
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      password,
      phone: String(fd.get("phone") ?? "") || undefined,
      role: apiRole,
      consent: {
        terms: true,
        privacy: true,
        disclaimer: true,
      },
    };

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const login = await signIn("credentials", {
        email: payload.email,
        password: payload.password,
        redirect: false,
      });
      if (login?.ok) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? t.errors.genericFail);
    setLoading(false);
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
        {/* Role segmented control */}
        <div>
          <div className="label">{t.roleLabel}</div>
          <div
            className="flex p-1 rounded-full"
            style={{ background: "#f5f8f6" }}
          >
            {ROLES.map((r) => (
              <button
                key={r.v}
                type="button"
                onClick={() => setRole(r.v)}
                className="flex-1 px-3 py-2 rounded-full text-sm font-semibold transition"
                style={{
                  background: role === r.v ? "#16302a" : "transparent",
                  color: role === r.v ? "#ffffff" : "#5b6863",
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">{t.name}</label>
          <input name="name" className="input" required minLength={2} />
        </div>
        <div>
          <label className="label">{t.email}</label>
          <input name="email" type="email" className="input" required autoComplete="email" />
        </div>
        <div>
          <label className="label">{t.phone}</label>
          <input name="phone" className="input" placeholder="+9665xxxxxxxx" autoComplete="tel" />
        </div>
        <div>
          <label className="label">{t.password}</label>
          <input
            name="password"
            type="password"
            className="input"
            required
            minLength={10}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrengthMeter value={password} dict={dict.passwordMeter} />
        </div>

        <label className="flex items-start gap-3 text-sm" style={{ padding: "10px 2px" }}>
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            style={{ accentColor: "#2f6a53", marginTop: 4 }}
          />
          <span className="text-muted-2" style={{ lineHeight: 1.75 }}>
            {t.agreePrefix}{" "}
            <Link href="/legal/terms" className="underline text-green-700">{t.termsLink}</Link>,{" "}
            <Link href="/legal/privacy" className="underline text-green-700">{t.privacyLink}</Link>{" "}
            {t.andWord}{" "}
            <Link href="/legal/disclaimer" className="underline text-green-700">{t.disclaimerLink}</Link>.
          </span>
        </label>

        {error && <div className="text-sm" style={{ color: "#b3261e" }}>{error}</div>}
        <button type="submit" disabled={loading || !consent} className="btn-primary w-full">
          {loading ? t.submitting : t.submit}
        </button>
      </form>

      <div className="mt-6 text-sm text-muted-2 text-center">
        {t.haveAccount}{" "}
        <Link href="/auth/signin" className="text-green-700 font-semibold">
          {t.signIn}
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
