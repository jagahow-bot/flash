import type { Locale } from "@/lib/i18n/config";
import { defaultLocale } from "@/lib/i18n/config";
import type { AppDictionary } from "@/lib/i18n/app-types";
import { getEmailDictionary } from "@/lib/i18n/dictionaries/email";
import {
  DATE_DICTIONARIES,
  PRICE_FORMAT_BY_LOCALE,
} from "@/lib/i18n/dictionary-dates";

type ResolvedAppDictionary = AppDictionary & {
  email: NonNullable<AppDictionary["email"]>;
};

export type { ResolvedAppDictionary };

const appDictionaries: Record<Locale, () => Promise<{ default: unknown }>> = {
  "zh-Hant": () => import("@/lib/i18n/dictionaries/app/zh-Hant"),
  en: () => import("@/lib/i18n/dictionaries/app/en"),
  ja: () => import("@/lib/i18n/dictionaries/app/ja"),
  ko: () => import("@/lib/i18n/dictionaries/app/ko"),
  es: () => import("@/lib/i18n/dictionaries/app/es"),
  "pt-BR": () => import("@/lib/i18n/dictionaries/app/pt-BR"),
  de: () => import("@/lib/i18n/dictionaries/app/de"),
  fr: () => import("@/lib/i18n/dictionaries/app/fr"),
  th: () => import("@/lib/i18n/dictionaries/app/th"),
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeDictionary(
  base: AppDictionary,
  override: Record<string, unknown>,
): AppDictionary {
  const result: Record<string, unknown> = { ...base };

  for (const [key, overrideVal] of Object.entries(override)) {
    if (overrideVal === undefined) continue;

    const baseVal = base[key as keyof AppDictionary];
    if (isPlainObject(baseVal) && isPlainObject(overrideVal)) {
      result[key] = { ...baseVal, ...overrideVal };
    } else {
      result[key] = overrideVal;
    }
  }

  return result as unknown as AppDictionary;
}

function withFormatDefaults(locale: Locale, dict: AppDictionary): AppDictionary {
  return {
    ...dict,
    dates: DATE_DICTIONARIES[locale],
    common: {
      ...dict.common,
      priceFormat: dict.common.priceFormat ?? PRICE_FORMAT_BY_LOCALE[locale],
    },
  };
}

export async function getAppDictionary(
  locale: Locale,
): Promise<ResolvedAppDictionary> {
  const baseModule = await appDictionaries[defaultLocale]();
  const defaultEmail = await getEmailDictionary(defaultLocale);
  const base = withFormatDefaults(defaultLocale, {
    ...(baseModule.default as AppDictionary),
    email: defaultEmail,
  });

  if (locale === defaultLocale) {
    return base as ResolvedAppDictionary;
  }

  const [localeModule, email] = await Promise.all([
    appDictionaries[locale](),
    getEmailDictionary(locale),
  ]);
  const merged = mergeDictionary(
    base,
    localeModule.default as Record<string, unknown>,
  );
  return withFormatDefaults(locale, {
    ...merged,
    email,
    locale,
  }) as ResolvedAppDictionary;
}
