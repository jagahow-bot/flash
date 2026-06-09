import type { Locale } from "@/lib/i18n/config";
import type { AppDictionary } from "@/lib/i18n/app-types";
import type {
  BudgetCurrency,
  IntakeForm,
  SizeUnit,
  TattooColorMode,
} from "@/types/intake-form";
import {
  BUDGET_CURRENCIES,
  DEFAULT_BUDGET_CURRENCY,
  DEFAULT_SIZE_UNIT,
  SIZE_UNITS,
} from "@/types/intake-form";

export const LOCALE_DEFAULT_BUDGET_CURRENCY: Record<Locale, BudgetCurrency> = {
  "zh-Hant": "TWD",
  en: "USD",
  ja: "JPY",
  ko: "KRW",
  es: "EUR",
  "pt-BR": "BRL",
  de: "EUR",
  fr: "EUR",
  th: "THB",
};

export function resolveSizeUnit(sizeUnit?: SizeUnit): SizeUnit {
  if (sizeUnit && (SIZE_UNITS as readonly string[]).includes(sizeUnit)) {
    return sizeUnit;
  }
  return DEFAULT_SIZE_UNIT;
}

export function resolveBudgetCurrency(
  budgetCurrency?: BudgetCurrency
): BudgetCurrency {
  if (
    budgetCurrency &&
    (BUDGET_CURRENCIES as readonly string[]).includes(budgetCurrency)
  ) {
    return budgetCurrency;
  }
  return DEFAULT_BUDGET_CURRENCY;
}

function sizeAlreadyHasUnit(size: string): boolean {
  return /\b(cm|公分|mm|毫米|in|inch|inches|英寸|吋)\b/i.test(size);
}

export function formatIntakeSize(
  size: string | undefined,
  sizeUnit?: SizeUnit
): string {
  const trimmed = size?.trim();
  if (!trimmed) return "";

  if (sizeAlreadyHasUnit(trimmed)) {
    return trimmed;
  }

  const unit = resolveSizeUnit(sizeUnit);
  return `${trimmed} ${unit}`;
}

export function formatIntakeBudget(
  budget: string | undefined,
  budgetCurrency?: BudgetCurrency
): string {
  const trimmed = budget?.trim();
  if (!trimmed) return "";

  const currency = resolveBudgetCurrency(budgetCurrency);
  if (new RegExp(`\\b${currency}\\b`, "i").test(trimmed)) {
    return trimmed;
  }

  return `${currency} ${trimmed}`;
}

export function formatIntakeSizeFromForm(intakeForm: Pick<IntakeForm, "size" | "sizeUnit">): string {
  return formatIntakeSize(intakeForm.size, intakeForm.sizeUnit);
}

export function formatIntakeBudgetFromForm(
  intakeForm: Pick<IntakeForm, "budget" | "budgetCurrency">
): string {
  return formatIntakeBudget(intakeForm.budget, intakeForm.budgetCurrency);
}

export function formatIntakeColorMode(
  colorMode: TattooColorMode | undefined,
  dict: AppDictionary
): string | undefined {
  if (!colorMode) return undefined;
  return dict.booking.colorModeOptions[colorMode] ?? colorMode;
}

export function formatIntakeStyle(
  style: string | undefined,
  dict: AppDictionary
): string | undefined {
  const trimmed = style?.trim();
  if (!trimmed) return undefined;
  return dict.booking.stylePresets[trimmed] ?? trimmed;
}

export function formatIntakeGender(
  gender: string | undefined,
  dict: AppDictionary
): string | undefined {
  const trimmed = gender?.trim();
  if (!trimmed) return undefined;
  return dict.booking.genderOptions[trimmed] ?? trimmed;
}
