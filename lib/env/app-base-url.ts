/**
 * Resolves the public app base URL for emails, OG tags, and auth redirects.
 * Priority: NEXT_PUBLIC_APP_URL → RENDER_EXTERNAL_URL → VERCEL_URL → localhost.
 */
export function resolveAppBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const renderUrl = process.env.RENDER_EXTERNAL_URL?.trim();
  if (renderUrl) {
    return renderUrl.replace(/\/$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}
