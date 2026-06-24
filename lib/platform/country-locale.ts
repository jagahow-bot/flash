import type { Locale } from "@/lib/i18n/config";

const COUNTRY_LOCALE: Record<string, Locale> = {
  tw: "zh-Hant",
  jp: "ja",
  kr: "ko",
  ko: "ko",
  us: "en",
  th: "th",
  vn: "vi",
  ph: "en",
};

export function localeFromCountry(country: string | undefined): Locale | undefined {
  if (!country?.trim()) {
    return undefined;
  }

  return COUNTRY_LOCALE[country.trim().toLowerCase()];
}
