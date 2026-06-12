import type { Locale } from "@/lib/i18n/config";

export type UserRole = "admin" | "artist" | "client" | "platform_admin";

export interface User {
  uid: string;
  email: string;
  /** 主要身分（admin 優先於 artist、client） */
  role: UserRole;
  /** 同一 Email 可同時具備多種身分 */
  roles?: UserRole[];
  studioId?: string;
  /** 使用者上次選擇的介面語系 */
  preferredLocale?: Locale;
}
