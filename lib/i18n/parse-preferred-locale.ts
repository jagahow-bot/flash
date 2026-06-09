import { isLocale, type Locale } from "@/lib/i18n/config";

export function parsePreferredLocale(value: unknown): Locale | undefined {
  return typeof value === "string" && isLocale(value) ? value : undefined;
}
