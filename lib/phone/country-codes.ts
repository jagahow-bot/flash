export type PhoneCountryCodeOption = {
  code: string;
  label: string;
  region: string;
};

/** 常用國碼（依使用頻率排序，台灣預設） */
export const PHONE_COUNTRY_CODES: PhoneCountryCodeOption[] = [
  { code: "+886", label: "台灣", region: "TW" },
  { code: "+852", label: "香港", region: "HK" },
  { code: "+853", label: "澳門", region: "MO" },
  { code: "+86", label: "中國", region: "CN" },
  { code: "+81", label: "日本", region: "JP" },
  { code: "+82", label: "韓國", region: "KR" },
  { code: "+65", label: "新加坡", region: "SG" },
  { code: "+60", label: "馬來西亞", region: "MY" },
  { code: "+66", label: "泰國", region: "TH" },
  { code: "+63", label: "菲律賓", region: "PH" },
  { code: "+84", label: "越南", region: "VN" },
  { code: "+62", label: "印尼", region: "ID" },
  { code: "+1", label: "美國／加拿大", region: "US" },
  { code: "+44", label: "英國", region: "GB" },
  { code: "+61", label: "澳洲", region: "AU" },
  { code: "+33", label: "法國", region: "FR" },
  { code: "+49", label: "德國", region: "DE" },
];

export const DEFAULT_PHONE_COUNTRY_CODE = "+886";

export function isValidPhoneCountryCode(code: string): boolean {
  return PHONE_COUNTRY_CODES.some((option) => option.code === code);
}

export function getPhoneCountryCodeLabel(code: string): string {
  const match = PHONE_COUNTRY_CODES.find((option) => option.code === code);
  return match ? `${match.label} ${match.code}` : code;
}
