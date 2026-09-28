import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CertifyForm } from "@/components/CertifyForm";
import { getDictionary, getLocale } from "@/lib/i18n";

export default async function CertifyPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const locale = getLocale();
  const dict = getDictionary(locale);
  const t = dict.certify;

  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: { report: true },
  });
  if (!property) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <div className="text-sm text-slate-500">{t.eyebrow}</div>
        <h1 className="text-2xl font-bold">{property.title}</h1>
        <div className="text-slate-600 text-sm mt-1">{t.description}</div>
      </div>
      <CertifyForm dict={t} locale={locale} propertyId={property.id} existing={property.report} />
    </div>
  );
}
