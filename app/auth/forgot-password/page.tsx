import { getDictionary } from "@/lib/i18n";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  const dict = getDictionary();
  return <ForgotPasswordForm dict={dict} />;
}
