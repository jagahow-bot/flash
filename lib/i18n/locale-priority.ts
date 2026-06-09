import type { Locale } from "@/lib/i18n/config";
import { defaultLocale } from "@/lib/i18n/config";

/**
 * Locale resolution priority:
 *
 * Marketing routes (/, /en, /ja, …):
 *   URL path segment only
 *
 * App routes (dashboard, studio booking, client portal, …):
 *   1. Authenticated user's `preferredLocale` in Firestore
 *   2. `flash-locale` cookie
 *   3. `defaultLocale` (zh-Hant)
 *
 * Anonymous users on app routes: cookie → default.
 */
export function resolveAppLocale(
  dbLocale: Locale | null | undefined,
  cookieLocale: Locale | null | undefined,
): Locale {
  if (dbLocale) {
    return dbLocale;
  }

  if (cookieLocale) {
    return cookieLocale;
  }

  return defaultLocale;
}
