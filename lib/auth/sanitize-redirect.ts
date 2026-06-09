export function sanitizeRedirectTo(
  redirectTo: string | null | undefined
): string | null {
  if (!redirectTo || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return null;
  }

  return redirectTo;
}

export function appendRedirectToUrl(
  baseUrl: string,
  redirectTo: string | null | undefined
): string {
  const safeRedirect = sanitizeRedirectTo(redirectTo);
  if (!safeRedirect) {
    return baseUrl;
  }

  const url = new URL(baseUrl);
  url.searchParams.set("redirect", safeRedirect);
  return url.toString();
}
