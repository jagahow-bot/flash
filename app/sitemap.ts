import type { MetadataRoute } from "next";
import { allLocalePaths, localeHrefLang } from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/i18n/site-url";
import { listPublicStudioSlugs } from "@/lib/firestore/studios.server";

function buildLanguageAlternates(siteUrl: string) {
  const languages: Record<string, string> = {};
  for (const { locale, path } of allLocalePaths()) {
    languages[localeHrefLang[locale]] =
      `${siteUrl}${path === "/" ? "" : path}`;
  }
  return languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();
  const languages = buildLanguageAlternates(siteUrl);

  const marketingEntries = allLocalePaths().map(({ path }) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.9,
    alternates: { languages },
  }));

  const studioSlugs = await listPublicStudioSlugs();
  const studioEntries = studioSlugs.map((slug) => ({
    url: `${siteUrl}/${slug}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...marketingEntries, ...studioEntries];
}
