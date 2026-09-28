import { cookies } from "next/headers";
import { LOCALE_COOKIE, type Locale } from "./i18n";

/**
 * Locale-aware error/status strings for API route handlers.
 *
 * Route handlers are server-only, so `next/headers` cookies() works here the
 * same way it does in Server Components — this reads the same `locale`
 * cookie the rest of the app uses, so an English-mode client gets English
 * API errors instead of the Arabic string leaking straight through
 * `data.error` into an otherwise-translated form.
 *
 * Scope: only messages that reach the client as a top-level `error`/
 * `message` field and get rendered. Zod field-level validation messages
 * (password policy, phone/national-ID regex `details.fieldErrors`) are never
 * read by any client component today, so they're left as-is rather than
 * translated for an audience that doesn't exist yet.
 */
export function getRequestLocale(): Locale {
  const c = cookies().get(LOCALE_COOKIE)?.value;
  return c === "en" ? "en" : "ar";
}

const MESSAGES = {
  ar: {
    unauthorized: "غير مصرح",
    forbidden: "ممنوع",
    notFound: "غير موجود",
    invalidData: "بيانات غير صحيحة",
    tooManyAttempts: "محاولات كثيرة",
    tooManyAttemptsRetry: "محاولات كثيرة. حاول مجددًا بعد قليل.",
    emailInUse: "البريد الإلكتروني مستخدم بالفعل",
    noFile: "لا يوجد ملف",
    fileTooLarge: "حجم الملف كبير جدًا",
    uploadFailed: "فشل الرفع",
    propertyNotFound: "العقار غير موجود",
    stripeNotConfigured: "بوابة الدفع غير مهيأة. أضف STRIPE_SECRET_KEY في .env",
    moyasarNotConfigured: "بوابة الدفع غير مهيأة. أضف MOYASAR_SECRET_KEY في .env",
    partialSaleUnavailable: "البيع الجزئي غير متاح حاليًا — قيد الترخيص النظامي.",
    propertyNotPartialSale: "هذا العقار غير متاح للبيع الجزئي",
    notAvailablePartialSale: "غير متاح للبيع الجزئي",
    acknowledgementRequired: "يجب استكمال إقرار المستثمر قبل الدفع.",
    maxSharesAvailable: (n: number) => `الحد الأقصى المتاح: ${n} حصة`,
    missingAcknowledgements: "إقرارات مفقودة",
    invalidCode: "الرمز غير صحيح",
    setupNotStarted: "لم يتم بدء الإعداد",
    invalidNumber: "رقم غير صحيح",
    codeInvalidOrExpired: "الرمز غير صالح أو منتهي",
    missingCode: "رمز مفقود",
    requestFailed: "فشل الطلب",
    notYetVerified: "لم يتم التحقق بعد",
    cannotRefundUnpaid: "لا يمكن استرداد استثمار غير مدفوع",
    missingPaymentReference: "مرجع الدفع مفقود",
    refundFailed: "فشل الاسترداد",
    stripeNotInitialized: "Stripe غير مهيأ",
    imageTooLarge: "حجم الصورة كبير جدًا (الحد 15MB قبل الضغط)",
    unsupportedImageType: "نوع الصورة غير مدعوم",
  },
  en: {
    unauthorized: "Unauthorized",
    forbidden: "Forbidden",
    notFound: "Not found",
    invalidData: "Invalid data",
    tooManyAttempts: "Too many attempts",
    tooManyAttemptsRetry: "Too many attempts. Please try again shortly.",
    emailInUse: "This email is already in use",
    noFile: "No file provided",
    fileTooLarge: "File is too large",
    uploadFailed: "Upload failed",
    propertyNotFound: "Property not found",
    stripeNotConfigured: "Payment gateway not configured. Add STRIPE_SECRET_KEY in .env",
    moyasarNotConfigured: "Payment gateway not configured. Add MOYASAR_SECRET_KEY in .env",
    partialSaleUnavailable: "Partial sale is not currently available — pending regulatory licensing.",
    propertyNotPartialSale: "This property is not available for partial sale",
    notAvailablePartialSale: "Not available for partial sale",
    acknowledgementRequired: "You must complete the investor acknowledgement before paying.",
    maxSharesAvailable: (n: number) => `Maximum available: ${n} shares`,
    missingAcknowledgements: "Missing acknowledgements",
    invalidCode: "Incorrect code",
    setupNotStarted: "Setup has not been started",
    invalidNumber: "Invalid number",
    codeInvalidOrExpired: "The code is invalid or has expired",
    missingCode: "Code is missing",
    requestFailed: "Request failed",
    notYetVerified: "Not verified yet",
    cannotRefundUnpaid: "Cannot refund an unpaid investment",
    missingPaymentReference: "Payment reference is missing",
    refundFailed: "Refund failed",
    stripeNotInitialized: "Stripe is not configured",
    imageTooLarge: "Image is too large (15MB limit before compression)",
    unsupportedImageType: "Unsupported image type",
  },
} as const;

export function apiMessages(locale: Locale) {
  return MESSAGES[locale];
}
