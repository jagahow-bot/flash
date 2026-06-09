import { NextRequest, NextResponse } from "next/server";
import {
  PROTECTED_ROUTES,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/constants";
import {
  defaultLocale,
  localeFromPathname,
  localeRouteSegments,
  type Locale,
} from "@/lib/i18n/config";
import {
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
  parseLocaleCookie,
} from "@/lib/i18n/locale-cookie";
import { resolveAppLocale } from "@/lib/i18n/locale-priority";
import { getPreferredLocaleFromSession } from "@/lib/i18n/preferred-locale.server";

const segmentToLocale = Object.fromEntries(
  Object.entries(localeRouteSegments)
    .filter(([, segment]) => segment !== "")
    .map(([locale, segment]) => [segment, locale as Locale]),
) as Record<string, Locale>;

function matchesRoute(pathname: string, routes: readonly string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isMarketingLocalePath(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return true;
  if (parts.length === 1) {
    return parts[0].toLowerCase() in segmentToLocale;
  }
  return false;
}

async function resolveLocale(
  request: NextRequest,
  pathname: string,
): Promise<Locale> {
  if (isMarketingLocalePath(pathname)) {
    return localeFromPathname(pathname);
  }

  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const dbLocale = session
    ? await getPreferredLocaleFromSession(session)
    : null;
  const cookieLocale = parseLocaleCookie(
    request.cookies.get(LOCALE_COOKIE_NAME)?.value,
  );

  return resolveAppLocale(dbLocale, cookieLocale);
}

async function withLocaleHeader(request: NextRequest, pathname: string) {
  const locale = await resolveLocale(request, pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);
  requestHeaders.set("x-pathname", pathname);
  return { requestHeaders, locale };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const { requestHeaders, locale } = await withLocaleHeader(request, pathname);

  const responseHeaders: HeadersInit = {};
  if (isMarketingLocalePath(pathname)) {
    responseHeaders["Set-Cookie"] =
      `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
  }

  const isProtected = matchesRoute(pathname, PROTECTED_ROUTES);

  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const redirect = NextResponse.redirect(loginUrl);
    if (responseHeaders["Set-Cookie"]) {
      redirect.headers.set("Set-Cookie", responseHeaders["Set-Cookie"] as string);
    }
    return redirect;
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (responseHeaders["Set-Cookie"]) {
    response.headers.set("Set-Cookie", responseHeaders["Set-Cookie"] as string);
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
