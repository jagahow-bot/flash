import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/i18n/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/", "/client/my-projects"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
