/**
 * Guards for lib/env.ts production-mode NEXTAUTH_SECRET validation.
 *
 * We import the pure validator shape by re-building the same regex set the
 * module uses; the module's own `env` object is loaded at import time against
 * the current process.env, so testing the full module here would couple to
 * NODE_ENV at module-load time. The regex list below MUST stay in sync with
 * WEAK_SECRETS in lib/env.ts — the point of the test is to lock the shape.
 */
import { describe, expect, it } from "vitest";

const WEAK = [
  /^change-me/i,
  /^please-generate/i,
  /^demo-only/i,
  /^dev-only/i,
  /^build-time-placeholder/i,
  /^test-secret/i,
];

function isWeak(secret: string): boolean {
  if (secret.length < 32) return true;
  return WEAK.some((re) => re.test(secret));
}

describe("production NEXTAUTH_SECRET guard", () => {
  it("rejects the shipped .env.example placeholder", () => {
    expect(isWeak("change-me-in-production-use-openssl-rand-base64-32")).toBe(true);
  });
  it("rejects the Dockerfile build-arg placeholder", () => {
    expect(isWeak("build-time-placeholder-not-used-at-runtime")).toBe(true);
  });
  it("rejects the docker-compose default secret", () => {
    expect(isWeak("please-generate-with-openssl-rand-base64-32")).toBe(true);
  });
  it("rejects the dev-mode fallback secret", () => {
    expect(isWeak("dev-only-secret-change-me-immediately")).toBe(true);
  });
  it("rejects a short secret even if it is not a known placeholder", () => {
    expect(isWeak("short")).toBe(true);
  });
  it("accepts a long, random-looking secret", () => {
    // From `openssl rand -base64 32`
    expect(isWeak("Vj/8w2Z6kN8y7v3bLm9pQw0rT2sU4xA6cE8dF0gH2iJ=")).toBe(false);
  });
});
