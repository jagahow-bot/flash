import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import {
  LOCALE_COOKIE_NAME,
  parseLocaleCookie,
} from "@/lib/i18n/locale-cookie";

const ACCEPT_LANGUAGE_TO_LOCALE: Record<string, Locale> = {
  "zh-tw": "zh-Hant",
  "zh-hant": "zh-Hant",
  "zh-hk": "zh-Hant",
  "pt-br": "pt-BR",
};

function localeFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;

  const candidates = header
    .split(",")
    .map((part) => {
      const [tag, qValue] = part.trim().split(";q=");
      return {
        tag: tag.trim().toLowerCase(),
        q: qValue ? Number.parseFloat(qValue) : 1,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of candidates) {
    if (tag in ACCEPT_LANGUAGE_TO_LOCALE) {
      return ACCEPT_LANGUAGE_TO_LOCALE[tag];
    }

    if (isLocale(tag)) {
      return tag;
    }

    const primary = tag.split("-")[0];
    if (primary === "pt") {
      return "pt-BR";
    }
    if (primary === "zh") {
      return "zh-Hant";
    }
    if (isLocale(primary)) {
      return primary;
    }
  }

  return null;
}

export async function resolveApiLocale(request: NextRequest): Promise<Locale> {
  const headerLocale = request.headers.get("x-locale");
  if (headerLocale && isLocale(headerLocale)) {
    return headerLocale;
  }

  const cookieStore = await cookies();
  const cookieLocale = parseLocaleCookie(
    cookieStore.get(LOCALE_COOKIE_NAME)?.value,
  );
  if (cookieLocale) {
    return cookieLocale;
  }

  const acceptLocale = localeFromAcceptLanguage(
    request.headers.get("accept-language"),
  );
  if (acceptLocale) {
    return acceptLocale;
  }

  return defaultLocale;
}
