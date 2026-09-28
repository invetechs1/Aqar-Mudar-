import { LegalArticle } from "@/components/LegalArticle";
import { getDocument } from "@/lib/legal-docs";
import { getDictionary, getLocale } from "@/lib/i18n";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  const locale = getLocale();
  const dict = getDictionary(locale);
  return <LegalArticle doc={getDocument("privacy", locale)} dict={dict.legal} locale={locale} />;
}
