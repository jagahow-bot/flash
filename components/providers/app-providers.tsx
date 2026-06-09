"use client";

import { AuthProvider } from "@/components/providers/auth-provider";
import { AppLocaleProvider } from "@/components/providers/locale-provider";
import { LocaleSync } from "@/components/providers/locale-sync";
import type { Locale } from "@/lib/i18n/config";
import type { AppDictionary } from "@/lib/i18n/app-types";

export function AppProviders({
  locale,
  appDict,
  children,
}: {
  locale: Locale;
  appDict: AppDictionary;
  children: React.ReactNode;
}) {
  return (
    <AppLocaleProvider locale={locale} dict={appDict}>
      <AuthProvider>
        <LocaleSync />
        {children}
      </AuthProvider>
    </AppLocaleProvider>
  );
}
