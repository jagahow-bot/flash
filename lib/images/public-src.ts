/** Relative paths for same-origin public assets work with next/image without remotePatterns. */
export function toPublicImageSrc(url: string): string {
  if (url.startsWith("/")) return url;

  try {
    const { pathname } = new URL(url);
    if (pathname.startsWith("/demo/seed/")) {
      return pathname;
    }
  } catch {
    // Not an absolute URL — return as-is (e.g. Firebase Storage URLs).
  }

  return url;
}
