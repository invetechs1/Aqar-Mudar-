import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VerifyPanel } from "@/components/VerifyPanel";
import { isNafathConfigured } from "@/lib/nafath";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account verification" };

export default async function VerifyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin?callbackUrl=/dashboard/verify");

  const dict = getDictionary();
  const t = dict.dashboardVerify;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true, phone: true,
      emailVerified: true, phoneVerified: true, nafathVerified: true,
      totpEnabled: true,
    },
  });
  if (!user) redirect("/dashboard");

  return (
    <div className="mx-auto page-x" style={{ maxWidth: 860, padding: "40px 32px 80px" }}>
      <h1 className="font-extrabold" style={{ fontSize: 32, letterSpacing: "-0.01em" }}>
        {t.title}
      </h1>
      <p className="mt-2 text-muted-2 font-light" style={{ fontSize: 15, lineHeight: 1.85 }}>
        {t.subtitle}
      </p>
      <div className="mt-8">
        <VerifyPanel
          dict={dict.verifyPanel}
          email={user.email}
          phone={user.phone}
          emailVerified={!!user.emailVerified}
          phoneVerified={!!user.phoneVerified}
          nafathVerified={!!user.nafathVerified}
          totpEnabled={user.totpEnabled}
          nafathReady={isNafathConfigured()}
        />
      </div>
    </div>
  );
}
