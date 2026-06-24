import type { AppDictionary } from "@/lib/i18n/app-types";
import { formatMessage } from "@/lib/i18n/format";
import {
  BUDGET_CURRENCIES,
  DEFAULT_BUDGET_CURRENCY,
  type BudgetCurrency,
} from "@/types/intake-form";
import type { Studio } from "@/types/studio";

export const QUOTE_CURRENCIES = BUDGET_CURRENCIES;

export const CURRENCY_SYMBOL: Record<BudgetCurrency, string> = {
  TWD: "NT$",
  USD: "$",
  JPY: "¥",
  KRW: "₩",
  EUR: "€",
  GBP: "£",
  THB: "฿",
  VND: "₫",
  BRL: "R$",
  PHP: "₱",
};

const COUNTRY_QUOTE_CURRENCY: Record<string, BudgetCurrency> = {
  tw: "TWD",
  jp: "JPY",
  kr: "KRW",
  ko: "KRW",
  us: "USD",
  th: "THB",
  vn: "VND",
  ph: "PHP",
  br: "BRL",
  gb: "GBP",
  de: "EUR",
  fr: "EUR",
  es: "EUR",
};

export function isBudgetCurrency(value: unknown): value is BudgetCurrency {
  return (
    typeof value === "string" &&
    (QUOTE_CURRENCIES as readonly string[]).includes(value)
  );
}

export function parseQuoteCurrency(value: unknown): BudgetCurrency | undefined {
  if (isBudgetCurrency(value)) {
    return value;
  }
  return undefined;
}

export function quoteCurrencyFromCountry(
  country: string | undefined,
): BudgetCurrency | undefined {
  if (!country?.trim()) {
    return undefined;
  }
  return COUNTRY_QUOTE_CURRENCY[country.trim().toLowerCase()];
}

export function resolveStudioQuoteCurrency(
  studio: Pick<Studio, "quoteCurrency"> | null | undefined,
): BudgetCurrency {
  return studio?.quoteCurrency ?? DEFAULT_BUDGET_CURRENCY;
}

export function getCurrencySymbol(currency: BudgetCurrency): string {
  return CURRENCY_SYMBOL[currency];
}

export function getPriceFormat(currency: BudgetCurrency): string {
  const symbol = getCurrencySymbol(currency);
  if (currency === "EUR") {
    return `${symbol}{amount}`;
  }
  return `${symbol}{amount}`;
}

export type FormatPriceOptions =
  | { common: Pick<AppDictionary["common"], "priceFormat">; currency?: never }
  | { currency: BudgetCurrency; common?: never };

export function formatPrice(
  value: number | string,
  options: FormatPriceOptions,
): string {
  if (typeof value === "string") {
    return value;
  }

  const amount = value.toLocaleString("en-US");
  const priceFormat =
    "currency" in options && options.currency
      ? getPriceFormat(options.currency)
      : options.common.priceFormat;

  return formatMessage(priceFormat, { amount });
}

export function formatStudioPrice(
  value: number | string,
  studio: Pick<Studio, "quoteCurrency"> | null | undefined,
  dict: AppDictionary,
): string {
  return formatPrice(value, {
    currency: resolveStudioQuoteCurrency(studio),
  });
}

export function formatPriceFieldLabel(
  template: string,
  currency: BudgetCurrency,
  params: Record<string, string | number> = {},
): string {
  return formatMessage(template, {
    symbol: getCurrencySymbol(currency),
    currency,
    ...params,
  });
}
