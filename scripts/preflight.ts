/* eslint-disable no-console */
/**
 * Pre-launch readiness check for Aqar Mudar.
 *
 *   npm run preflight
 *
 * Run against the production .env / DB before flipping DNS. Prints a GO/NO-GO
 * report that walks through every launch-blocking configuration guard the
 * app enforces at runtime: environment variables, DB reachability, no stale
 * demo accounts, every admin has 2FA, and (optional/soft) the third-party
 * integrations that the app can degrade on but a real launch should not.
 *
 * Exit code: 0 if everything is GO, 1 if any REQUIRED check fails. Soft
 * warnings never fail the exit code — they print as yellow caveats.
 */

import { PrismaClient } from "@prisma/client";

type Severity = "ok" | "warn" | "fail";
type Check = { name: string; severity: Severity; detail?: string };

const BOX = { ok: "✓", warn: "!", fail: "✗" };
const COLOR = {
  ok: (s: string) => `\x1b[32m${s}\x1b[0m`,
  warn: (s: string) => `\x1b[33m${s}\x1b[0m`,
  fail: (s: string) => `\x1b[31m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

const checks: Check[] = [];
const push = (c: Check) => checks.push(c);

const WEAK_SECRETS = [
  /^change-me/i,
  /^please-generate/i,
  /^demo-only/i,
  /^dev-only/i,
  /^build-time-placeholder/i,
  /^test-secret/i,
];

function requireEnv(name: string): string | null {
  const v = process.env[name];
  if (!v || v === "") {
    push({ name: `env ${name}`, severity: "fail", detail: "unset" });
    return null;
  }
  return v;
}

function warnIfMissingEnv(name: string, why: string): void {
  const v = process.env[name];
  if (!v || v === "") {
    push({ name: `env ${name}`, severity: "warn", detail: why });
  } else {
    push({ name: `env ${name}`, severity: "ok" });
  }
}

async function main() {
  console.log();
  console.log(COLOR.bold("Aqar Mudar — pre-launch preflight"));
  console.log(COLOR.dim(`${new Date().toISOString()}  ·  NODE_ENV=${process.env.NODE_ENV ?? "development"}`));
  console.log();

  // ---- 1. Required env --------------------------------------------------
  const nodeEnv = process.env.NODE_ENV ?? "development";
  if (nodeEnv !== "production") {
    push({
      name: "NODE_ENV",
      severity: "warn",
      detail: `is '${nodeEnv}', preflight is intended for production — most checks will be soft.`,
    });
  } else {
    push({ name: "NODE_ENV", severity: "ok", detail: "production" });
  }

  const dbUrl = requireEnv("DATABASE_URL");
  const nextauthUrl = requireEnv("NEXTAUTH_URL");
  const secret = requireEnv("NEXTAUTH_SECRET");

  // ---- 2. NEXTAUTH_SECRET strength -------------------------------------
  if (secret) {
    const weak = WEAK_SECRETS.find((re) => re.test(secret));
    if (weak) {
      push({
        name: "NEXTAUTH_SECRET strength",
        severity: "fail",
        detail: `looks like a placeholder (${weak}). Generate with: openssl rand -base64 32`,
      });
    } else if (secret.length < 32) {
      push({
        name: "NEXTAUTH_SECRET strength",
        severity: "fail",
        detail: `only ${secret.length} chars; need >= 32 in production.`,
      });
    } else {
      push({ name: "NEXTAUTH_SECRET strength", severity: "ok" });
    }
  }

  // ---- 3. NEXTAUTH_URL isn't localhost in production -------------------
  if (nextauthUrl && nodeEnv === "production" && /localhost|127\.0\.0\.1/.test(nextauthUrl)) {
    push({
      name: "NEXTAUTH_URL public",
      severity: "fail",
      detail: `points at localhost; production needs the public HTTPS origin.`,
    });
  } else if (nextauthUrl) {
    push({ name: "NEXTAUTH_URL public", severity: "ok" });
  }

  // ---- 4. External integrations (soft warnings) ------------------------
  if (process.env.STORAGE_DRIVER === "s3") {
    for (const k of ["S3_BUCKET", "S3_REGION", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"]) {
      if (!process.env[k]) {
        push({ name: `env ${k}`, severity: "fail", detail: "STORAGE_DRIVER=s3 but key missing" });
      }
    }
  } else if (nodeEnv === "production") {
    push({
      name: "STORAGE_DRIVER",
      severity: "warn",
      detail: "set to 'local' — uploads will NOT persist across container restarts. Set STORAGE_DRIVER=s3 before launch.",
    });
  }

  if (process.env.EMAIL_DRIVER !== "resend" && nodeEnv === "production") {
    push({
      name: "EMAIL_DRIVER",
      severity: "warn",
      detail: "not set to 'resend' — verification / password-reset emails will NOT reach real inboxes.",
    });
  }
  if (process.env.EMAIL_DRIVER === "resend") {
    warnIfMissingEnv("RESEND_API_KEY", "EMAIL_DRIVER=resend requires this key.");
  }

  if (process.env.SMS_DRIVER !== "twilio" && nodeEnv === "production") {
    push({
      name: "SMS_DRIVER",
      severity: "warn",
      detail: "not set to 'twilio' — phone-OTP codes will print to the server log, not reach phones.",
    });
  }

  if (nodeEnv === "production") {
    warnIfMissingEnv("MOYASAR_SECRET_KEY", "Payments disabled without it.");
    warnIfMissingEnv("NAFATH_API_URL", "Nafath will run in mock mode — no real identity verification.");
    warnIfMissingEnv("SENTRY_DSN", "No error-tracking in production.");
  }

  // ---- 5. Feature flags -------------------------------------------------
  if (/^(1|true|yes|on)$/i.test(process.env.FEATURE_PARTIAL_SALE ?? "")) {
    push({
      name: "FEATURE_PARTIAL_SALE",
      severity: "warn",
      detail: "is ON. Make sure the CMA/SPV licence is actually in place before accepting real money.",
    });
  } else {
    push({ name: "FEATURE_PARTIAL_SALE", severity: "ok", detail: "off (waiting on licence)" });
  }

  // ---- 6. DB reachability + hard checks --------------------------------
  if (!dbUrl) {
    print(checks);
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    push({ name: "DB reachable", severity: "ok" });
  } catch (e) {
    push({ name: "DB reachable", severity: "fail", detail: String((e as Error).message).slice(0, 200) });
    print(checks);
    await prisma.$disconnect();
    process.exit(1);
  }

  // 6a. No demo seed accounts in production
  if (nodeEnv === "production") {
    const demos = ["admin@aqarmudar.sa", "owner@aqarmudar.sa", "investor@aqarmudar.sa", "engineer@aqarmudar.sa"];
    const found = await prisma.user.findMany({
      where: { email: { in: demos } },
      select: { email: true },
    });
    if (found.length > 0) {
      push({
        name: "Demo accounts purged",
        severity: "fail",
        detail: `${found.length} seed accounts still live: ${found.map((f) => f.email).join(", ")}. Delete them before launch.`,
      });
    } else {
      push({ name: "Demo accounts purged", severity: "ok" });
    }
  }

  // 6b. Every ADMIN has TOTP enabled (the auth path refuses the login
  //     anyway, but surfacing it here lets ops fix it before anyone tries)
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", disabled: false },
    select: { email: true, totpEnabled: true },
  });
  const adminsNoTotp = admins.filter((a) => !a.totpEnabled);
  if (admins.length === 0) {
    push({
      name: "Admin accounts",
      severity: "fail",
      detail: "No active ADMIN accounts exist — nobody can approve properties or issue refunds.",
    });
  } else if (adminsNoTotp.length > 0) {
    push({
      name: "Admin 2FA coverage",
      severity: "fail",
      detail: `${adminsNoTotp.length}/${admins.length} admins missing TOTP: ${adminsNoTotp.map((a) => a.email).join(", ")}`,
    });
  } else {
    push({ name: "Admin 2FA coverage", severity: "ok", detail: `${admins.length} admins, all with TOTP` });
  }

  // 6c. Pending migrations?
  // We can't easily introspect this from the client, but it's worth a hint.
  push({
    name: "Migrations",
    severity: "warn",
    detail: "Verify manually: `npx prisma migrate status` should report 'Database schema is up to date'.",
  });

  await prisma.$disconnect();
  print(checks);
}

function print(cs: Check[]) {
  const padName = Math.max(...cs.map((c) => c.name.length)) + 2;
  for (const c of cs) {
    const mark = c.severity === "ok" ? COLOR.ok(BOX.ok) : c.severity === "warn" ? COLOR.warn(BOX.warn) : COLOR.fail(BOX.fail);
    const name = c.name.padEnd(padName);
    const detail = c.detail ? COLOR.dim(" — " + c.detail) : "";
    console.log(`  ${mark}  ${name}${detail}`);
  }
  console.log();
  const fails = cs.filter((c) => c.severity === "fail").length;
  const warns = cs.filter((c) => c.severity === "warn").length;
  if (fails > 0) {
    console.log(COLOR.fail(`NO-GO — ${fails} blocker${fails === 1 ? "" : "s"}${warns ? `, ${warns} warning${warns === 1 ? "" : "s"}` : ""}. Fix the ✗ rows above.`));
    process.exit(1);
  } else if (warns > 0) {
    console.log(COLOR.warn(`GO with ${warns} warning${warns === 1 ? "" : "s"} — review the ! rows above before launch.`));
  } else {
    console.log(COLOR.ok("GO — all checks passed."));
  }
  console.log();
}

main().catch((e) => {
  console.error(COLOR.fail("Preflight crashed:"), e);
  process.exit(1);
});
