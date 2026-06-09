export const SIZE_UNITS = ["cm", "in"] as const;
export type SizeUnit = (typeof SIZE_UNITS)[number];
export const DEFAULT_SIZE_UNIT: SizeUnit = "cm";

export const BUDGET_CURRENCIES = [
  "TWD",
  "USD",
  "JPY",
  "KRW",
  "EUR",
  "GBP",
  "THB",
  "BRL",
] as const;
export type BudgetCurrency = (typeof BUDGET_CURRENCIES)[number];
export const DEFAULT_BUDGET_CURRENCY: BudgetCurrency = "TWD";

export type ClientGender = "男" | "女" | "其他" | "不願透露";

export const TATTOO_COLOR_MODES = ["color", "black_and_white"] as const;
export type TattooColorMode = (typeof TATTOO_COLOR_MODES)[number];

export interface ClientSocialContacts {
  clientName?: string;
  gender?: ClientGender;
  /** 國碼，例：+886 */
  phoneCountryCode?: string;
  /** 國內號碼（不含國碼） */
  phone?: string;
  /** WhatsApp 國碼（與手機不同時使用） */
  whatsappCountryCode?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  line?: string;
  threads?: string;
}

export interface IntakeForm {
  placement: string;
  size: string;
  /** 尺寸單位；舊資料缺省視為 cm */
  sizeUnit?: SizeUnit;
  style: string;
  /** 彩色或黑白；舊資料缺省為未填寫 */
  colorMode?: TattooColorMode;
  description: string;
  isCoverUp: boolean;
  budget: string;
  /** 預算幣別；舊資料缺省視為 TWD */
  budgetCurrency?: BudgetCurrency;
  availability: string[];
  notes: string;
  placementPhotoUrl?: string;
  referenceUrls?: string[];
  /** 選填社群聯絡方式 */
  socialContacts?: ClientSocialContacts;
}
