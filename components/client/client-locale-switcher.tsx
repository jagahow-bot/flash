"use client";

import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { appDictToSwitcherDict } from "@/lib/i18n/switcher-dictionary";
import { cn } from "@/lib/utils";

export function ClientLocaleSwitcher({ className }: { className?: string }) {
  const dict = useAppDictionary();

  return (
    <LanguageSwitcher
      dict={appDictToSwitcherDict(dict)}
      className={cn(className)}
    />
  );
}
