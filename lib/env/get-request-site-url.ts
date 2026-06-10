import { headers } from "next/headers";
import { resolveAppBaseUrl } from "@/lib/env/app-base-url";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function siteUrlFromRequestHeaders(headersList: Headers): string | null {
  const forwardedHost = headersList.get("x-forwarded-host");
  const host =
    forwardedHost?.split(",")[0]?.trim() ?? headersList.get("host")?.trim();
  if (!host) {
    return null;
  }

  const forwardedProto = headersList
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const protocol =
    forwardedProto === "http" || forwardedProto === "https"
      ? forwardedProto
      : "https";

  return normalizeBaseUrl(`${protocol}://${host}`);
}

/**
 * Resolves the canonical public site URL for sitemap, robots, and other
 * request-scoped SEO output. Prefers configured URL, then the incoming
 * request host (custom domain), then build/runtime env fallbacks.
 */
export async function getRequestSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return normalizeBaseUrl(configured);
  }

  try {
    const headersList = await headers();
    const fromRequest = siteUrlFromRequestHeaders(headersList);
    if (fromRequest) {
      return fromRequest;
    }
  } catch {
    // headers() is unavailable outside a request context (e.g. build-time).
  }

  return resolveAppBaseUrl();
}
