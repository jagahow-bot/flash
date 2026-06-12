const STUDIO_CLIENT_PATH = /^\/([^/]+)\/(book|p)(\/|$)/;

export type ClientAuthStudioContext = {
  slug: string;
  name: string;
  logoUrl?: string;
};

export function parseStudioSlugFromClientAuthRedirect(
  redirect: string | null | undefined
): string | null {
  if (!redirect?.startsWith("/")) {
    return null;
  }

  const match = redirect.match(STUDIO_CLIENT_PATH);
  return match?.[1] ?? null;
}

export function resolveClientAuthStudioSlug(
  redirect?: string | null,
  studio?: string | null
): string | null {
  const explicit = studio?.trim();
  if (explicit) {
    return explicit;
  }

  return parseStudioSlugFromClientAuthRedirect(redirect);
}

export function buildClientAuthSearchParams(options: {
  redirect?: string | null;
  studioSlug?: string | null;
}): string {
  const params = new URLSearchParams();

  if (options.redirect) {
    params.set("redirect", options.redirect);
  }

  if (options.studioSlug) {
    params.set("studio", options.studioSlug);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function buildClientAuthPath(
  path: "/client/login" | "/client/register",
  options: { redirect?: string | null; studioSlug?: string | null }
): string {
  return `${path}${buildClientAuthSearchParams(options)}`;
}

export function buildClientLoginRedirectUrl(
  studioSlug: string,
  redirectPath: string
): string {
  return buildClientAuthPath("/client/login", {
    redirect: redirectPath,
    studioSlug,
  });
}
