import { getDictionary } from "@/lib/i18n";
import { VerifyEmailStatus } from "@/components/VerifyEmailStatus";

export default function VerifyEmailPage() {
  const dict = getDictionary();
  return <VerifyEmailStatus dict={dict} />;
}
