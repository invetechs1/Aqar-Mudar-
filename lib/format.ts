import type { Locale } from "./i18n";

/**
 * All formatters take an explicit locale — never infer it from the server's
 * default. A page that renders in English must pass "en" through; falling
 * back silently to "ar-SA" is how the currency/date bug shipped originally.
 */
export function formatSAR(n: number, locale: Locale = "ar"): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(d: Date | string, locale: Locale = "ar"): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatNumber(n: number, locale: Locale = "ar"): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US").format(n);
}

/**
 * Domain vocabulary (enum -> label) is bilingual by construction: every key
 * below must exist in both `ar` and `en`. `vocab(dict, table, value)` throws
 * in dev if a value is missing from a table instead of silently printing the
 * raw enum — that mismatch is a data bug worth surfacing immediately.
 */
export const PROPERTY_TYPE: Record<Locale, Record<string, string>> = {
  ar: {
    APARTMENT: "شقة",
    VILLA: "فيلا",
    LAND: "أرض",
    COMMERCIAL: "تجاري",
    BUILDING: "مبنى",
  },
  en: {
    APARTMENT: "Apartment",
    VILLA: "Villa",
    LAND: "Land",
    COMMERCIAL: "Commercial",
    BUILDING: "Building",
  },
};

export const LISTING_TYPE: Record<Locale, Record<string, string>> = {
  ar: {
    SALE: "للبيع",
    PARTIAL_SALE: "بيع جزئي",
    INVESTMENT: "استثمار",
  },
  en: {
    SALE: "For sale",
    PARTIAL_SALE: "Partial sale",
    INVESTMENT: "Investment",
  },
};

export const CONDITION: Record<Locale, Record<string, string>> = {
  ar: {
    EXCELLENT: "ممتاز",
    GOOD: "جيد",
    FAIR: "مقبول",
    POOR: "ضعيف",
  },
  en: {
    EXCELLENT: "Excellent",
    GOOD: "Good",
    FAIR: "Fair",
    POOR: "Poor",
  },
};

export const RISK: Record<Locale, Record<string, string>> = {
  ar: {
    LOW: "منخفض",
    MEDIUM: "متوسط",
    HIGH: "مرتفع",
  },
  en: {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
  },
};

export const PROPERTY_STATUS: Record<Locale, Record<string, string>> = {
  ar: {
    PENDING_REVIEW: "قيد المراجعة",
    CERTIFIED: "معتمد",
    REJECTED: "مرفوض",
    SOLD: "مباع",
    ARCHIVED: "مؤرشف",
  },
  en: {
    PENDING_REVIEW: "Pending review",
    CERTIFIED: "Certified",
    REJECTED: "Rejected",
    SOLD: "Sold",
    ARCHIVED: "Archived",
  },
};

/**
 * City names are stored in Arabic in the database (free-text, matched
 * exactly by filters) — the `value` below must stay Arabic so filtering
 * still works, only the displayed `label` is bilingual.
 */
export const CITY_OPTIONS: { value: string; label: Record<Locale, string> }[] = [
  { value: "الرياض", label: { ar: "الرياض", en: "Riyadh" } },
  { value: "جدة", label: { ar: "جدة", en: "Jeddah" } },
  { value: "الدمام", label: { ar: "الدمام", en: "Dammam" } },
  { value: "الخبر", label: { ar: "الخبر", en: "Khobar" } },
  { value: "مكة", label: { ar: "مكة", en: "Makkah" } },
];

export function vocab(
  table: Record<Locale, Record<string, string>>,
  locale: Locale,
  value: string
): string {
  const label = table[locale][value];
  if (label === undefined) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[i18n] missing "${value}" in vocab table for locale "${locale}"`);
    }
    return value;
  }
  return label;
}
