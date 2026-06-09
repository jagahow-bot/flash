import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import {
  defaultLocale,
  localeHrefLang,
  localeOpenGraph,
  localePath,
  locales,
} from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/i18n/site-url";
import type { LandingDictionary } from "@/lib/i18n/types";

function buildLanguageAlternates(siteUrl: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    const path = localePath(loc);
    languages[localeHrefLang[loc]] = `${siteUrl}${path === "/" ? "" : path}`;
  }
  languages["x-default"] = `${siteUrl}/`;
  return languages;
}

export function buildLandingMetadata(
  locale: Locale,
  dict: LandingDictionary,
): Metadata {
  const siteUrl = getSiteUrl();
  const canonicalPath = localePath(locale);
  const canonical = `${siteUrl}${canonicalPath === "/" ? "" : canonicalPath}`;
  const alternateLocales = locales
    .filter((loc) => loc !== locale)
    .map((loc) => localeOpenGraph[loc]);

  const ogImageUrl = `${siteUrl}/og/flash.svg`;

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    keywords: dict.meta.keywords,
    alternates: {
      canonical,
      languages: buildLanguageAlternates(siteUrl),
    },
    openGraph: {
      type: "website",
      locale: localeOpenGraph[locale],
      alternateLocale: alternateLocales,
      url: canonical,
      siteName: "FLASH",
      title: dict.meta.title,
      description: dict.meta.description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "FLASH — Tattoo studio booking & project management",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
    other:
      locale === defaultLocale
        ? undefined
        : {
            "content-language": localeHrefLang[locale],
          },
  };
}
