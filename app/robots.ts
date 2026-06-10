import type { MetadataRoute } from "next";
import { getRequestSiteUrl } from "@/lib/env/get-request-site-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = await getRequestSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/setup/",
        "/api/",
        "/client/",
        "/*/book",
        "/*/p/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
