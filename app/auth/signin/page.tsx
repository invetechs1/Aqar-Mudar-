import { getDictionary } from "@/lib/i18n";
import { SignInForm } from "@/components/SignInForm";

export default function SignInPage() {
  const dict = getDictionary();
  return <SignInForm dict={dict} />;
}
