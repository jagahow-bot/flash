import Link from "next/link";
import { headers } from "next/headers";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { canActAsClient, canAccessStudioPortal } from "@/lib/auth/user-roles";
import { SiteHeaderNav } from "@/components/marketing/site-header-nav";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { defaultLocale, isLocale, localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { LandingDictionary } from "@/lib/i18n/types";

type SiteHeaderProps = {
  dict?: LandingDictionary;
};

export async function SiteHeader({ dict: dictProp }: SiteHeaderProps = {}) {
  const headersList = await headers();
  const headerLocale = headersList.get("x-locale");
  const locale =
    headerLocale && isLocale(headerLocale) ? headerLocale : defaultLocale;
  const dict = dictProp ?? (await getDictionary(locale));

  const user = await getAuthenticatedUser();
  const isAuthenticated = Boolean(user);
  const isClient = user ? canActAsClient(user) : false;
  const isStudio = user ? canAccessStudioPortal(user) : false;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href={localePath(dict.locale)}
          className="font-semibold tracking-tight"
          aria-label="FLASH home"
        >
          FLASH
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher dict={dict} className="sm:hidden" />
          <SiteHeaderNav
            dict={dict}
            isAuthenticated={isAuthenticated}
            isClient={isClient}
            isStudio={isStudio}
          />
        </div>
      </div>
    </header>
  );
}
