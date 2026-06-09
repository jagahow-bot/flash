import type { StudioSocialLinks } from "@/types/studio";

function trimField(value: string | undefined | null): string | undefined {
  if (value == null) {
    return undefined;
  }

  const trimmed = value.trim().replace(/^@+/, "");
  return trimmed || undefined;
}

export function normalizeStudioSocialLinks(
  links: StudioSocialLinks | undefined | null
): StudioSocialLinks | undefined {
  if (!links || typeof links !== "object") {
    return undefined;
  }

  const normalized: StudioSocialLinks = {};

  const instagram = trimField(links.instagram);
  if (instagram) {
    normalized.instagram = instagram;
  }

  const facebook = trimField(links.facebook);
  if (facebook) {
    normalized.facebook = facebook;
  }

  const line = trimField(links.line);
  if (line) {
    normalized.line = line;
  }

  const threads = trimField(links.threads);
  if (threads) {
    normalized.threads = threads;
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

export function formatInstagramHandle(username: string): string {
  const trimmed = username.trim().replace(/^@+/, "");
  return trimmed ? `@${trimmed}` : "";
}
