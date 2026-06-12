import type { MetadataRoute } from "next";
import { getAllBlogSlugs, getBlogPostLocales } from "@/lib/content/blog-posts";
import {
  allLocalePaths,
  localeHrefLang,
  localePath,
  locales,
} from "@/lib/i18n/config";
import { getRequestSiteUrl } from "@/lib/env/get-request-site-url";
import { getStudiosForSitemap } from "@/lib/firestore/studios.server";

type SitemapEntry = MetadataRoute.Sitemap[number];

function buildHomeLanguageAlternates(siteUrl: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const { locale, path } of allLocalePaths()) {
    languages[localeHrefLang[locale]] =
      `${siteUrl}${path === "/" ? "" : path}`;
  }
  return languages;
}

function buildSamePathLanguageAlternates(
  siteUrl: string,
  path: string,
): Record<string, string> {
  const url = `${siteUrl}${path}`;
  return Object.fromEntries(
    locales.map((locale) => [localeHrefLang[locale], url]),
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await getRequestSiteUrl();
  const now = new Date();
  const homeLanguages = buildHomeLanguageAlternates(siteUrl);

  const marketingEntries: SitemapEntry[] = allLocalePaths().map(({ path }) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.9,
    alternates: { languages: homeLanguages },
  }));

  const legalPaths = ["/privacy", "/terms"] as const;
  const legalEntries: SitemapEntry[] = legalPaths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
    alternates: { languages: buildSamePathLanguageAlternates(siteUrl, path) },
  }));

  const blogIndexLanguages = Object.fromEntries(
    locales.map((locale) => [
      localeHrefLang[locale],
      `${siteUrl}${localePath(locale, "/blog")}`,
    ]),
  );
  blogIndexLanguages["x-default"] = `${siteUrl}/blog`;

  const blogIndexEntries: SitemapEntry[] = locales.map((locale) => ({
    url: `${siteUrl}${localePath(locale, "/blog")}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
    alternates: { languages: blogIndexLanguages },
  }));

  const blogPostEntries: SitemapEntry[] = getAllBlogSlugs().flatMap((slug) => {
    const availableLocales = getBlogPostLocales(slug);
    const languages = Object.fromEntries(
      availableLocales.map((locale) => [
        localeHrefLang[locale],
        `${siteUrl}${localePath(locale, `/blog/${slug}`)}`,
      ]),
    );
    languages["x-default"] = `${siteUrl}/blog/${slug}`;

    return availableLocales.map((locale) => ({
      url: `${siteUrl}${localePath(locale, `/blog/${slug}`)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.55,
      alternates: { languages },
    }));
  });

  // Low-priority auth landing pages (excludes protected /client/* flows).
  const authEntries: SitemapEntry[] = [
    {
      url: `${siteUrl}/login`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/register`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  const studios = await getStudiosForSitemap();
  const studioEntries: SitemapEntry[] = studios.map(({ slug, lastModified }) => ({
    url: `${siteUrl}/${slug}`,
    lastModified: lastModified ?? now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    ...marketingEntries,
    ...legalEntries,
    ...blogIndexEntries,
    ...blogPostEntries,
    ...authEntries,
    ...studioEntries,
  ];
}
