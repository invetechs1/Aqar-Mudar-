import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PropertyForm } from "@/components/PropertyForm";
import { getDictionary, getLocale } from "@/lib/i18n";

export const metadata = { title: "Add a new property" };

export default async function NewPropertyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin?callbackUrl=/properties/new");

  const locale = getLocale();
  const dict = getDictionary(locale);
  const t = dict.properties.new;

  return (
    <div className="mx-auto page-x" style={{ maxWidth: 940, padding: "40px 32px 80px" }}>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wider text-muted">{t.eyebrow}</div>
        <h1 className="font-extrabold mt-2" style={{ fontSize: 34, letterSpacing: "-0.01em" }}>
          {t.title}
        </h1>
        <p className="mt-2 text-muted-2 font-light" style={{ fontSize: 15, lineHeight: 1.85 }}>
          {t.subtitle}
        </p>
      </div>
      <PropertyForm dict={dict.properties.form} locale={locale} />
    </div>
  );
}
