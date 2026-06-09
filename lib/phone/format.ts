import {
  DEFAULT_PHONE_COUNTRY_CODE,
  isValidPhoneCountryCode,
  PHONE_COUNTRY_CODES,
} from "@/lib/phone/country-codes";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** 將國碼與國內號碼合併為國際格式（例：+886912345678） */
export function formatInternationalPhone(
  countryCode: string,
  nationalNumber: string
): string {
  const code = countryCode.trim() || DEFAULT_PHONE_COUNTRY_CODE;
  let digits = digitsOnly(nationalNumber);

  if (!digits) {
    return "";
  }

  if (code === "+886" && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return `${code}${digits}`;
}

export function formatPhoneDisplay(
  countryCode: string | undefined,
  nationalNumber: string | undefined
): string | undefined {
  const national = nationalNumber?.trim();
  if (!national) {
    return undefined;
  }

  const code = countryCode?.trim() || DEFAULT_PHONE_COUNTRY_CODE;
  return `${code} ${national}`;
}

export function parseInternationalPhone(
  value: string
): { countryCode: string; national: string } | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (!trimmed.startsWith("+")) {
    return {
      countryCode: DEFAULT_PHONE_COUNTRY_CODE,
      national: trimmed,
    };
  }

  const sortedCodes = [...PHONE_COUNTRY_CODES].sort(
    (a, b) => b.code.length - a.code.length
  );

  for (const option of sortedCodes) {
    if (trimmed.startsWith(option.code)) {
      const rest = trimmed.slice(option.code.length).trim();
      const national = rest.replace(/\s+/g, "");

      return {
        countryCode: option.code,
        national: option.code === "+886" && national.startsWith("0")
          ? national
          : national,
      };
    }
  }

  const match = trimmed.match(/^(\+\d{1,4})(\d+)$/);
  if (!match) {
    return null;
  }

  return {
    countryCode: match[1],
    national: match[2],
  };
}

export function splitStoredPhone(
  countryCode: string | undefined,
  phone: string | undefined
): { countryCode: string; national: string } {
  if (countryCode && isValidPhoneCountryCode(countryCode) && phone?.trim()) {
    return {
      countryCode,
      national: phone.trim(),
    };
  }

  if (phone?.trim()) {
    const parsed = parseInternationalPhone(phone.trim());
    if (parsed) {
      return parsed;
    }
  }

  return {
    countryCode: DEFAULT_PHONE_COUNTRY_CODE,
    national: "",
  };
}

export function phonesMatch(
  phoneA: string | undefined,
  phoneB: string | undefined
): boolean {
  if (!phoneA || !phoneB) {
    return false;
  }

  return digitsOnly(phoneA) === digitsOnly(phoneB);
}
