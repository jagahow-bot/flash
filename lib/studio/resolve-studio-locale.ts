import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { parsePreferredLocale } from "@/lib/i18n/parse-preferred-locale";

export function resolveStudioLocale(
  studio?: { preferredLocale?: Locale } | null
): Locale {
  return studio?.preferredLocale ?? defaultLocale;
}

export function parseStudioPreferredLocale(value: unknown): Locale | undefined {
  return parsePreferredLocale(value);
}
