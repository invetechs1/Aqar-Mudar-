import { LegalArticle } from "@/components/LegalArticle";
import { getDocument } from "@/lib/legal-docs";
import { getDictionary, getLocale } from "@/lib/i18n";

export const metadata = { title: "Disclaimer" };

export default function DisclaimerPage() {
  const locale = getLocale();
  const dict = getDictionary(locale);
  return <LegalArticle doc={getDocument("disclaimer", locale)} dict={dict.legal} locale={locale} />;
}
