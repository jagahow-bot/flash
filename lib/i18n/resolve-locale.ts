import { cookies, headers } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import {
  defaultLocale,
  isLocale,
  localeFromPathname,
  type Locale,
} from "@/lib/i18n/config";
import {
  LOCALE_COOKIE_NAME,
  parseLocaleCookie,
} from "@/lib/i18n/locale-cookie";
import { resolveAppLocale } from "@/lib/i18n/locale-priority";
import { getPreferredLocaleFromSession } from "@/lib/i18n/preferred-locale.server";

export async function getRequestLocale(): Promise<Locale> {
  const headersList = await headers();
  const headerLocale = headersList.get("x-locale");
  if (headerLocale && isLocale(headerLocale)) {
    return headerLocale;
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const dbLocale = session
    ? await getPreferredLocaleFromSession(session)
    : null;
  const cookieLocale = parseLocaleCookie(
    cookieStore.get(LOCALE_COOKIE_NAME)?.value,
  );

  return resolveAppLocale(dbLocale, cookieLocale);
}

export function resolveLocaleFromPathname(pathname: string): Locale {
  return localeFromPathname(pathname);
}
