import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { verifyTotp } from "@/lib/totp";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  useSecureCookies: process.env.NODE_ENV === "production",
  pages: { signIn: "/auth/signin" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user || user.disabled) return null;

        const ok = await verifyPassword(credentials.password, user.passwordHash);
        if (!ok) return null;

        // Admin accounts must have TOTP enabled before they can sign in.
        // The signin UI maps this error code to a dedicated message that
        // tells the admin to enable 2FA (via a password-reset flow or
        // directly on the server), rather than a generic "invalid login".
        if (user.role === "ADMIN" && !user.totpEnabled) {
          throw new Error("ADMIN_2FA_REQUIRED");
        }

        if (user.totpEnabled) {
          if (!credentials.totp) {
            throw new Error("TOTP_REQUIRED");
          }
          if (!user.totpSecret || !verifyTotp(user.totpSecret, credentials.totp)) {
            throw new Error("TOTP_INVALID");
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as unknown as { id: string }).id;
        token.role = (user as unknown as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};
