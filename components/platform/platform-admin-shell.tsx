"use client";

import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import {
  useAppDictionary,
  useAppLocale,
} from "@/components/providers/locale-provider";
import { getRoleLabel } from "@/lib/copy";
import { localePath } from "@/lib/i18n/config";
import { appDictToSwitcherDict } from "@/lib/i18n/switcher-dictionary";
import type { User } from "@/types/user";

export function PlatformAdminShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const dict = useAppDictionary();
  const locale = useAppLocale();
  const marketingHomeHref = localePath(locale);
  const switcherDict = appDictToSwitcherDict(dict);
  const pa = dict.platformAdmin;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{pa.title}</p>
            <p className="truncate font-medium">
              {user.email}{" "}
              <span className="text-muted-foreground">
                （{getRoleLabel(user.role, dict)}）
              </span>
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <LanguageSwitcher dict={switcherDict} className="hidden sm:block" />
            <Link
              href={marketingHomeHref}
              className="rounded-lg border border-input px-3 py-1.5 text-sm transition-colors hover:bg-muted"
            >
              {dict.common.home}
            </Link>
            {user.studioId ? (
              <Link
                href="/dashboard"
                className="rounded-lg border border-input px-3 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                {dict.shell.navHome}
              </Link>
            ) : null}
            <LogoutButton redirectTo={marketingHomeHref}>
              {dict.common.logout}
            </LogoutButton>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
