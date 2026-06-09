import type { NextResponse } from "next/server";
import type { Locale } from "@/lib/i18n/config";
import {
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
} from "@/lib/i18n/locale-cookie";

export function setLocaleCookieOnResponse(
  response: NextResponse,
  locale: Locale,
): void {
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
}
