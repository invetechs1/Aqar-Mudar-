import { LegalArticle } from "@/components/LegalArticle";
import { getDocument } from "@/lib/legal-docs";
import { getDictionary, getLocale } from "@/lib/i18n";

export const metadata = { title: "Investment Risk Disclosure" };

export default function RiskPage() {
  const locale = getLocale();
  const dict = getDictionary(locale);
  return <LegalArticle doc={getDocument("risk", locale)} dict={dict.legal} locale={locale} />;
}
