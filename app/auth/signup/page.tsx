import { getDictionary } from "@/lib/i18n";
import { SignUpForm } from "@/components/SignUpForm";

export default function SignUpPage() {
  const dict = getDictionary();
  return <SignUpForm dict={dict} />;
}
