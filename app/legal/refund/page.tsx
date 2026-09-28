import { LegalArticle } from "@/components/LegalArticle";
import { getDocument } from "@/lib/legal-docs";
import { getDictionary, getLocale } from "@/lib/i18n";

export const metadata = { title: "Fees & Refund Policy" };

export default function RefundPage() {
  const locale = getLocale();
  const dict = getDictionary(locale);
  return <LegalArticle doc={getDocument("refund", locale)} dict={dict.legal} locale={locale} />;
}
