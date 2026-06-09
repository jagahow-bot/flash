import type { Locale } from "@/lib/i18n/config";
import type { LandingDictionary } from "@/lib/i18n/types";

const dictionaries: Record<
  Locale,
  () => Promise<{ default: LandingDictionary }>
> = {
  "zh-Hant": () => import("@/lib/i18n/dictionaries/zh-Hant"),
  en: () => import("@/lib/i18n/dictionaries/en"),
  ja: () => import("@/lib/i18n/dictionaries/ja"),
  ko: () => import("@/lib/i18n/dictionaries/ko"),
  es: () => import("@/lib/i18n/dictionaries/es"),
  "pt-BR": () => import("@/lib/i18n/dictionaries/pt-BR"),
  de: () => import("@/lib/i18n/dictionaries/de"),
  fr: () => import("@/lib/i18n/dictionaries/fr"),
  th: () => import("@/lib/i18n/dictionaries/th"),
};

export async function getDictionary(locale: Locale): Promise<LandingDictionary> {
  const module = await dictionaries[locale]();
  return module.default;
}
