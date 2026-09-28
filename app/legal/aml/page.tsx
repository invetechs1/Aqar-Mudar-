import { LegalArticle } from "@/components/LegalArticle";
import { getDocument } from "@/lib/legal-docs";
import { getDictionary, getLocale } from "@/lib/i18n";

export const metadata = { title: "AML / KYC" };

export default function AmlPage() {
  const locale = getLocale();
  const dict = getDictionary(locale);
  return <LegalArticle doc={getDocument("aml", locale)} dict={dict.legal} locale={locale} />;
}
