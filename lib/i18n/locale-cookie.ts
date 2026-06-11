import type { Locale } from "@/lib/i18n/config";
import { defaultLocale, isLocale } from "@/lib/i18n/config";

export const LOCALE_COOKIE_NAME = "flash-locale";

/** Dispatched on `window` when the locale cookie changes (client only). */
export const LOCALE_CHANGE_EVENT = "flash-locale-change";

/** Cookie lifetime: 1 year */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseLocaleCookie(value: string | undefined): Locale | null {
  if (!value) return null;
  return isLocale(value) ? value : null;
}

export function localeCookieValue(locale: Locale): string {
  return locale === defaultLocale ? defaultLocale : locale;
}
