"use client";

import type { Dictionary } from "@/lib/i18n";

/**
 * A 4-segment password-strength meter driven by the same rules as
 * lib/password.ts. It does not gate submission — the server enforces the
 * policy — it exists so the user gets faster feedback.
 */
export function scorePassword(v: string): number {
  let s = 0;
  if (v.length >= 10) s++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  return Math.min(s, 4);
}

export function PasswordStrengthMeter({
  value,
  dict,
}: {
  value: string;
  dict: Dictionary["passwordMeter"];
}) {
  const s = scorePassword(value);
  const label = value ? dict.levels[Math.max(0, s - 1)] : "";
  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => {
          const filled = i < s;
          const bg = !filled
            ? "#e6eae8"
            : s <= 2
            ? "#c9a24a"
            : "#2f6a53";
          return (
            <div
              key={i}
              style={{ background: bg, height: 6, borderRadius: 999, flex: 1, transition: "background .15s" }}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-muted">{dict.label}</span>
        <span className="text-xs font-semibold" style={{ color: s <= 2 ? "#b28a35" : "#2f6a53" }}>
          {label}
        </span>
      </div>
    </div>
  );
}
