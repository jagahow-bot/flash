import type { Metadata } from "next";
import {
  getBlogPostLocales,
  listBlogPostsForLocale,
} from "@/lib/content/blog-posts";
import {
  localeHrefLang,
  localeOpenGraph,
  localePath,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/i18n/site-url";
import type { LandingDictionary } from "@/lib/i18n/types";

function buildBlogIndexLanguageAlternates(
  siteUrl: string,
): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    languages[localeHrefLang[locale]] = `${siteUrl}${localePath(locale, "/blog")}`;
  }

  languages["x-default"] = `${siteUrl}/blog`;
  return languages;
}

export function buildBlogIndexMetadata(
  locale: Locale,
  dict: LandingDictionary,
): Metadata {
  const siteUrl = getSiteUrl();
  const canonicalPath = localePath(locale, "/blog");
  const canonical = `${siteUrl}${canonicalPath}`;
  const alternateLocales = locales
    .filter((loc) => loc !== locale)
    .map((loc) => localeOpenGraph[loc]);

  return {
    title: dict.blog.metaTitle,
    description: dict.blog.metaDescription,
    alternates: {
      canonical,
      languages: buildBlogIndexLanguageAlternates(siteUrl),
    },
    openGraph: {
      type: "website",
      locale: localeOpenGraph[locale],
      alternateLocale: alternateLocales,
      url: canonical,
      siteName: "FLASH",
      title: dict.blog.metaTitle,
      description: dict.blog.metaDescription,
    },
    robots: { index: true, follow: true },
  };
}

export function buildBlogPostMetadata(
  locale: Locale,
  slug: string,
  title: string,
  summary: string,
): Metadata {
  const siteUrl = getSiteUrl();
  const canonicalPath = localePath(locale, `/blog/${slug}`);
  const canonical = `${siteUrl}${canonicalPath}`;
  const availableLocales = getBlogPostLocales(slug);
  const alternateLocales = availableLocales
    .filter((loc) => loc !== locale)
    .map((loc) => localeOpenGraph[loc]);

  const languages = Object.fromEntries(
    availableLocales.map((loc) => [
      localeHrefLang[loc],
      `${siteUrl}${localePath(loc, `/blog/${slug}`)}`,
    ]),
  );
  languages["x-default"] = `${siteUrl}/blog/${slug}`;

  return {
    title,
    description: summary,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "article",
      locale: localeOpenGraph[locale],
      alternateLocale: alternateLocales,
      url: canonical,
      siteName: "FLASH",
      title,
      description: summary,
    },
    robots: { index: true, follow: true },
  };
}

export function getBlogIndexPostCount(locale: Locale): number {
  return listBlogPostsForLocale(locale).length;
}
