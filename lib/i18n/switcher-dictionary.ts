import type { AppDictionary } from "@/lib/i18n/app-types";
import type { LandingDictionary } from "@/lib/i18n/types";

/** Minimal landing dict for LanguageSwitcher (only header fields are read). */
export function appDictToSwitcherDict(dict: AppDictionary): LandingDictionary {
  return {
    locale: dict.locale,
    header: {
      home: dict.common.home,
      login: dict.auth.login,
      myProjects: dict.clientPortal.myProjects,
      studioRegister: dict.auth.registerStudio,
      studioDashboard: dict.shell.studioDashboard,
      language: dict.common.language,
      switchToEn: "English",
      switchToZh: dict.common.switchToZh,
    },
  } as LandingDictionary;
}
