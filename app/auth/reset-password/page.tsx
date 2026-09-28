import { getDictionary } from "@/lib/i18n";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  const dict = getDictionary();
  return <ResetPasswordForm dict={dict} />;
}
