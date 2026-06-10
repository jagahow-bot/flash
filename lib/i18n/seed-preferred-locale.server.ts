import type { NextRequest } from "next/server";
import type { Locale } from "@/lib/i18n/config";
import { updateUserPreferredLocale } from "@/lib/firestore/users.server";
import { LOCALE_COOKIE_NAME, parseLocaleCookie } from "@/lib/i18n/locale-cookie";

/**
 * When the user has no Firestore `preferredLocale`, persist the `flash-locale`
 * cookie so emails and server-side locale resolution stay in sync with the UI.
 */
export async function seedPreferredLocaleFromCookie(
  request: NextRequest,
  uid: string,
  existingPreferredLocale: Locale | undefined,
): Promise<Locale | undefined> {
  if (existingPreferredLocale) {
    return existingPreferredLocale;
  }

  const cookieLocale = parseLocaleCookie(
    request.cookies.get(LOCALE_COOKIE_NAME)?.value,
  );

  if (!cookieLocale) {
    return undefined;
  }

  await updateUserPreferredLocale(uid, cookieLocale);
  return cookieLocale;
}
