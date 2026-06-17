import { defaultLocale, localeHrefLang, type Locale } from "@/lib/i18n/config";

export type PhoneCountryCodeOption = {
  code: string;
  regions: string[];
};

/** Common dial codes (by usage frequency; Taiwan is the default). */
export const PHONE_COUNTRY_CODES: PhoneCountryCodeOption[] = [
  { code: "+886", regions: ["TW"] },
  { code: "+852", regions: ["HK"] },
  { code: "+853", regions: ["MO"] },
  { code: "+86", regions: ["CN"] },
  { code: "+81", regions: ["JP"] },
  { code: "+82", regions: ["KR"] },
  { code: "+65", regions: ["SG"] },
  { code: "+60", regions: ["MY"] },
  { code: "+66", regions: ["TH"] },
  { code: "+63", regions: ["PH"] },
  { code: "+84", regions: ["VN"] },
  { code: "+62", regions: ["ID"] },
  { code: "+1", regions: ["US", "CA"] },
  { code: "+44", regions: ["GB"] },
  { code: "+61", regions: ["AU"] },
  { code: "+33", regions: ["FR"] },
  { code: "+49", regions: ["DE"] },
];

export const DEFAULT_PHONE_COUNTRY_CODE = "+886";

const regionDisplayNamesCache = new Map<string, Intl.DisplayNames>();

function getRegionDisplayNames(locale: Locale): Intl.DisplayNames {
  const tag = localeHrefLang[locale];
  let cached = regionDisplayNamesCache.get(tag);
  if (!cached) {
    cached = new Intl.DisplayNames([tag], { type: "region" });
    regionDisplayNamesCache.set(tag, cached);
  }
  return cached;
}

export function getPhoneCountryRegionLabel(
  regions: string[],
  locale: Locale
): string {
  const displayNames = getRegionDisplayNames(locale);
  return regions
    .map((region) => displayNames.of(region) ?? region)
    .join(" / ");
}

export function getPhoneCountryCodeOptionLabel(
  option: PhoneCountryCodeOption,
  locale: Locale
): string {
  return getPhoneCountryRegionLabel(option.regions, locale);
}

export function isValidPhoneCountryCode(code: string): boolean {
  return PHONE_COUNTRY_CODES.some((option) => option.code === code);
}

export function getPhoneCountryCodeLabel(
  code: string,
  locale: Locale = defaultLocale
): string {
  const match = PHONE_COUNTRY_CODES.find((option) => option.code === code);
  return match
    ? `${getPhoneCountryCodeOptionLabel(match, locale)} ${match.code}`
    : code;
}
