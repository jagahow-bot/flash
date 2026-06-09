"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { AppDictionary } from "@/lib/i18n/app-types";

type LocaleContextValue = {
  locale: Locale;
  dict: AppDictionary;
};

const AppLocaleContext = createContext<LocaleContextValue | null>(null);

export function AppLocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: AppDictionary;
  children: React.ReactNode;
}) {
  return (
    <AppLocaleContext.Provider value={{ locale, dict }}>
      {children}
    </AppLocaleContext.Provider>
  );
}

export function useAppDictionary(): AppDictionary {
  const ctx = useContext(AppLocaleContext);
  if (!ctx) {
    throw new Error("useAppDictionary must be used within AppLocaleProvider");
  }
  return ctx.dict;
}

export function useAppLocale(): Locale {
  const ctx = useContext(AppLocaleContext);
  if (!ctx) {
    throw new Error("useAppLocale must be used within AppLocaleProvider");
  }
  return ctx.locale;
}

/** Safe variant for components that may render outside provider (e.g. marketing-only). */
export function useAppDictionaryOptional(): AppDictionary | null {
  return useContext(AppLocaleContext)?.dict ?? null;
}
