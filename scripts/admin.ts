/* eslint-disable no-console */
/**
 * Admin CLI for Aqar Mudar.
 *
 *   npm run admin -- <command> [args...]
 *
 * Operational tools the person on-call needs on day one and that the web UI
 * deliberately does not expose (creating the first admin, demoting a
 * compromised one, nuking its 2FA when the phone is lost). Every mutation is
 * written to AuditLog so there's a post-incident trail.
 *
 * Commands:
 *   list                                 — print active admins + their 2FA status
 *   create <email> <name> [phone]        — mint a brand-new admin, random password
 *   promote <email>                      — flip an existing user's role to ADMIN
 *   demote <email>                       — flip an existing admin to OWNER
 *   disable <email>                      — set disabled=true (blocks signin)
 *   enable <email>                       — set disabled=false
 *   reset-2fa <email>                    — wipe TOTP (user must re-enroll at next signin)
 *   reset-password <email>               — reset to a freshly-generated random password
 *
 * The create/reset-password commands print the generated secret to stdout
 * exactly once and never persist it anywhere. Capture it, hand it to the
 * person through a private channel, and tell them to change it after signing
 * in. Nothing here should be scripted into unattended jobs.
 */

import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const COLOR = {
  ok: (s: string) => `\x1b[32m${s}\x1b[0m`,
  warn: (s: string) => `\x1b[33m${s}\x1b[0m`,
  err: (s: string) => `\x1b[31m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

/**
 * Generate a password that will pass the strong-password policy
 * (>=10 chars, upper/lower/digit/symbol, no weak-list match). We take 18
 * random bytes as base64 and splice in a guaranteed symbol so the password
 * survives the policy regardless of what random bytes picked.
 */
function generateStrongPassword(): string {
  const base = randomBytes(18).toString("base64").replace(/[+/=]/g, "");
  // Force a mix: 'A', 'a', '1' and '!' prepended so we always clear the regex.
  // The entropy still comes from the base, which is 18 random bytes.
  return `Aa1!${base}`;
}

async function audit(action: string, resource: string, resourceId: string | null, metadata: Record<string, unknown>) {
  await prisma.auditLog.create({
    data: {
      action,
      resource,
      resourceId,
      userId: null,
      metadata: {
        ...metadata,
        source: "admin-cli",
        operator: process.env.USER ?? "unknown",
      },
      userAgent: `admin-cli/${process.version}`,
    },
  });
}

async function findUser(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true, email: true, name: true, role: true,
      disabled: true, totpEnabled: true, createdAt: true,
    },
  });
  if (!user) {
    console.error(COLOR.err(`✗ No user with email '${email}'`));
    process.exit(1);
  }
  return user;
}

// ---- Commands ----------------------------------------------------------

async function cmdList() {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: {
      email: true, name: true, disabled: true, totpEnabled: true,
      emailVerified: true, createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
  if (admins.length === 0) {
    console.log(COLOR.warn("No admin accounts exist."));
    return;
  }
  console.log(COLOR.bold(`\n${admins.length} admin account${admins.length === 1 ? "" : "s"}:\n`));
  for (const a of admins) {
    const flags = [
      a.disabled ? COLOR.err("DISABLED") : COLOR.ok("active"),
      a.totpEnabled ? COLOR.ok("2FA") : COLOR.err("no-2FA"),
      a.emailVerified ? COLOR.ok("email✓") : COLOR.warn("email✗"),
    ].join("  ");
    console.log(`  ${a.email.padEnd(32)}  ${flags}  ${COLOR.dim(`— ${a.name}`)}`);
  }
  console.log();
}

async function cmdCreate(email: string, name: string, phone?: string) {
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    console.error(COLOR.err(`✗ A user with email '${email}' already exists. Did you mean 'promote'?`));
    process.exit(1);
  }
  const password = generateStrongPassword();
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      phone: phone ?? null,
      passwordHash,
      role: "ADMIN",
      emailVerified: null, // force verification just like anyone else
    },
    select: { id: true, email: true },
  });
  await audit("admin.create", "user", user.id, { email: user.email });
  console.log(COLOR.ok(`\n✓ Admin created: ${user.email}`));
  console.log(COLOR.bold(`  One-time password (copy NOW, we will not show it again):`));
  console.log(COLOR.bold(`    ${password}\n`));
  console.log(COLOR.warn("  Give this to the admin over a private channel. They should:"));
  console.log(COLOR.warn("    1. sign in"));
  console.log(COLOR.warn("    2. change the password immediately"));
  console.log(COLOR.warn("    3. enable 2FA at /dashboard/verify (REQUIRED — admins without 2FA cannot sign in)"));
  console.log();
}

async function cmdPromote(email: string) {
  const user = await findUser(email);
  if (user.role === "ADMIN") {
    console.log(COLOR.warn(`✓ ${email} is already an admin.`));
    return;
  }
  if (!user.totpEnabled) {
    console.error(COLOR.err(`✗ ${email} does not have 2FA enabled. Admins must enable 2FA at /dashboard/verify first — otherwise they'll be locked out at signin.`));
    process.exit(1);
  }
  await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
  await audit("admin.promote", "user", user.id, { from: user.role, to: "ADMIN" });
  console.log(COLOR.ok(`✓ Promoted ${email} (${user.role} → ADMIN)`));
}

async function cmdDemote(email: string) {
  const user = await findUser(email);
  if (user.role !== "ADMIN") {
    console.log(COLOR.warn(`✓ ${email} is not an admin (${user.role}).`));
    return;
  }
  const adminCount = await prisma.user.count({ where: { role: "ADMIN", disabled: false } });
  if (adminCount <= 1) {
    console.error(COLOR.err(`✗ Refusing to demote the last active admin. Create another admin first.`));
    process.exit(1);
  }
  await prisma.user.update({ where: { id: user.id }, data: { role: "OWNER" } });
  await audit("admin.demote", "user", user.id, { from: "ADMIN", to: "OWNER" });
  console.log(COLOR.ok(`✓ Demoted ${email} to OWNER`));
}

async function cmdDisable(email: string) {
  const user = await findUser(email);
  if (user.disabled) {
    console.log(COLOR.warn(`✓ ${email} is already disabled.`));
    return;
  }
  if (user.role === "ADMIN") {
    const otherAdmins = await prisma.user.count({
      where: { role: "ADMIN", disabled: false, NOT: { id: user.id } },
    });
    if (otherAdmins === 0) {
      console.error(COLOR.err(`✗ Refusing to disable the last active admin.`));
      process.exit(1);
    }
  }
  await prisma.user.update({ where: { id: user.id }, data: { disabled: true } });
  await audit("user.disable", "user", user.id, { email: user.email });
  console.log(COLOR.ok(`✓ Disabled ${email}`));
}

async function cmdEnable(email: string) {
  const user = await findUser(email);
  if (!user.disabled) {
    console.log(COLOR.warn(`✓ ${email} is already enabled.`));
    return;
  }
  await prisma.user.update({ where: { id: user.id }, data: { disabled: false } });
  await audit("user.enable", "user", user.id, { email: user.email });
  console.log(COLOR.ok(`✓ Enabled ${email}`));
}

async function cmdReset2fa(email: string) {
  const user = await findUser(email);
  if (!user.totpEnabled) {
    console.log(COLOR.warn(`✓ ${email} has no 2FA to reset.`));
    return;
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { totpEnabled: false, totpSecret: null },
  });
  await audit("user.reset_2fa", "user", user.id, { email: user.email });
  console.log(COLOR.ok(`✓ 2FA reset for ${email}. They'll re-enroll at next signin.`));
  if (user.role === "ADMIN") {
    console.log(COLOR.warn(`  ⚠ ${email} is an ADMIN. They will be blocked from signing in until they re-enable 2FA.`));
    console.log(COLOR.warn(`    If they can't, re-enroll via /dashboard/verify in a separate browser session, or demote them first.`));
  }
}

async function cmdResetPassword(email: string) {
  const user = await findUser(email);
  const password = generateStrongPassword();
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  await audit("user.reset_password", "user", user.id, { email: user.email });
  console.log(COLOR.ok(`\n✓ Password reset for ${email}.`));
  console.log(COLOR.bold(`  One-time password (copy NOW):`));
  console.log(COLOR.bold(`    ${password}\n`));
  console.log(COLOR.warn("  Give it to them over a private channel and tell them to change it after signing in.\n"));
}

// ---- Dispatch ----------------------------------------------------------

function usage(): never {
  console.log(`
${COLOR.bold("Aqar Mudar admin CLI")}

  npm run admin -- <command> [args...]

Commands:
  ${COLOR.ok("list")}                                 List all admins and their 2FA status
  ${COLOR.ok("create")} <email> <name> [phone]        Create a new admin (random password)
  ${COLOR.ok("promote")} <email>                      Promote an existing user to ADMIN (requires 2FA already enabled)
  ${COLOR.ok("demote")} <email>                       Demote an admin to OWNER (refuses the last admin)
  ${COLOR.ok("disable")} <email>                      Block signin for a user (refuses the last admin)
  ${COLOR.ok("enable")} <email>                       Reverse of disable
  ${COLOR.ok("reset-2fa")} <email>                    Wipe TOTP; user re-enrolls at next signin
  ${COLOR.ok("reset-password")} <email>               Generate a new random password (printed once)

${COLOR.dim("Every mutation is written to AuditLog with source=admin-cli and the shell user.")}
`);
  process.exit(1);
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  try {
    switch (cmd) {
      case "list":           await cmdList(); break;
      case "create":         if (args.length < 2) usage(); await cmdCreate(args[0], args[1], args[2]); break;
      case "promote":        if (!args[0]) usage(); await cmdPromote(args[0]); break;
      case "demote":         if (!args[0]) usage(); await cmdDemote(args[0]); break;
      case "disable":        if (!args[0]) usage(); await cmdDisable(args[0]); break;
      case "enable":         if (!args[0]) usage(); await cmdEnable(args[0]); break;
      case "reset-2fa":      if (!args[0]) usage(); await cmdReset2fa(args[0]); break;
      case "reset-password": if (!args[0]) usage(); await cmdResetPassword(args[0]); break;
      default:               usage();
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(COLOR.err("admin CLI crashed:"), e);
  process.exit(1);
});
