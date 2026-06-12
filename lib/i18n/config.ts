export const locales = [
  "zh-Hant",
  "en",
  "ja",
  "ko",
  "es",
  "pt-BR",
  "de",
  "fr",
  "th",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh-Hant";

/** URL path segment (lowercase) for each locale; default locale has no prefix. */
export const localeRouteSegments: Record<Locale, string> = {
  "zh-Hant": "",
  en: "en",
  ja: "ja",
  ko: "ko",
  es: "es",
  "pt-BR": "pt-br",
  de: "de",
  fr: "fr",
  th: "th",
};

/** Native names for the language switcher. */
export const localeLabels: Record<Locale, string> = {
  "zh-Hant": "繁體中文",
  en: "English",
  ja: "日本語",
  ko: "한국어",
  es: "Español",
  "pt-BR": "Português",
  de: "Deutsch",
  fr: "Français",
  th: "ไทย",
};

/** BCP 47 tags for hreflang and lang attributes. */
export const localeHrefLang: Record<Locale, string> = {
  "zh-Hant": "zh-Hant",
  en: "en",
  ja: "ja",
  ko: "ko",
  es: "es",
  "pt-BR": "pt-BR",
  de: "de",
  fr: "fr",
  th: "th",
};

/** Open Graph locale codes. */
export const localeOpenGraph: Record<Locale, string> = {
  "zh-Hant": "zh_TW",
  en: "en_US",
  ja: "ja_JP",
  ko: "ko_KR",
  es: "es_ES",
  "pt-BR": "pt_BR",
  de: "de_DE",
  fr: "fr_FR",
  th: "th_TH",
};

const segmentToLocale = Object.fromEntries(
  Object.entries(localeRouteSegments)
    .filter(([, segment]) => segment !== "")
    .map(([locale, segment]) => [segment, locale as Locale]),
) as Record<string, Locale>;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localePath(locale: Locale, path = ""): string {
  const suffix = path.startsWith("/") ? path : path ? `/${path}` : "";
  if (locale === defaultLocale) return suffix || "/";
  const segment = localeRouteSegments[locale];
  return `/${segment}${suffix}`;
}

export function localeFromPathname(pathname: string): Locale {
  const segment = pathname.split("/")[1]?.toLowerCase();
  if (segment && segment in segmentToLocale) {
    return segmentToLocale[segment];
  }
  return defaultLocale;
}

export function isBlogPath(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return false;
  if (parts[0] === "blog") return true;
  if (parts.length >= 2 && parts[1] === "blog") {
    return parts[0].toLowerCase() in segmentToLocale;
  }
  return false;
}

/** Blog path suffix without locale prefix (e.g. `/blog` or `/blog/slug`). */
export function blogPathFromPathname(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "blog") {
    return parts.length > 1 ? `/blog/${parts.slice(1).join("/")}` : "/blog";
  }
  if (parts.length >= 2 && parts[1] === "blog") {
    return parts.length > 2 ? `/blog/${parts.slice(2).join("/")}` : "/blog";
  }
  return "/blog";
}

/** Paths where locale is determined by the URL (marketing home + blog). */
export function isLocaleFromUrlPath(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return true;
  if (parts.length === 1) {
    if (parts[0].toLowerCase() in segmentToLocale) return true;
    return parts[0] === "blog";
  }
  if (parts[0] === "blog") return true;
  if (parts.length >= 2 && parts[1] === "blog") {
    return parts[0].toLowerCase() in segmentToLocale;
  }
  return false;
}

/** Strip a marketing locale prefix from app paths (e.g. `/en/cooltatt/book` → `/cooltatt/book`). */
export function stripLocalePrefixFromPathname(pathname: string): {
  locale: Locale;
  pathname: string;
} | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  const locale = segmentToLocale[parts[0].toLowerCase()];
  if (!locale) return null;

  return {
    locale,
    pathname: `/${parts.slice(1).join("/")}`,
  };
}

export function allLocalePaths(): { locale: Locale; path: string }[] {
  return locales.map((locale) => ({
    locale,
    path: localePath(locale),
  }));
}
