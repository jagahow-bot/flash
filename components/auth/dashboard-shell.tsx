"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { cn } from "@/lib/utils";

export function DashboardShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const dict = useAppDictionary();
  const locale = useAppLocale();
  const marketingHomeHref = localePath(locale);
  const switcherDict = appDictToSwitcherDict(dict);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{dict.shell.studioDashboard}</p>
            <p className="font-medium">
              {user.email}{" "}
              <span className="text-muted-foreground">
                （{getRoleLabel(user.role, dict)}）
              </span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher dict={switcherDict} className="hidden sm:block" />
            <Link
              href={marketingHomeHref}
              className={cn(
                "rounded-lg border border-input px-3 py-1.5 text-sm transition-colors hover:bg-muted",
              )}
            >
              {dict.common.home}
            </Link>
            <LogoutButton redirectTo={marketingHomeHref}>
              {dict.common.logout}
            </LogoutButton>
          </div>
        </div>
        <nav className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/dashboard"
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm transition-colors",
              pathname === "/dashboard"
                ? "bg-muted font-medium"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {dict.shell.navHome}
          </Link>
          {user.role === "admin" && (
            <>
              <Link
                href="/dashboard/artists"
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors",
                  pathname.startsWith("/dashboard/artists")
                    ? "bg-muted font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {dict.shell.navArtists}
              </Link>
              <Link
                href="/dashboard/settings"
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors",
                  pathname.startsWith("/dashboard/settings")
                    ? "bg-muted font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {dict.shell.navSettings}
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
