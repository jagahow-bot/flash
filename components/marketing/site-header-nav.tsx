"use client";

import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { Button, buttonVariants } from "@/components/ui/button";
import { localePath } from "@/lib/i18n/config";
import type { LandingDictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

export function SiteHeaderNav({
  dict,
  isAuthenticated,
  isClient,
  isStudio,
}: {
  dict: LandingDictionary;
  isAuthenticated: boolean;
  isClient: boolean;
  isStudio: boolean;
}) {
  const homeHref = localePath(dict.locale);

  if (isAuthenticated) {
    return (
      <nav
        className="flex flex-wrap items-center justify-end gap-1 sm:gap-2 text-sm"
        aria-label="Main navigation"
      >
        <LanguageSwitcher dict={dict} className="hidden sm:inline-flex" />
        <Link
          href={homeHref}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          {dict.header.home}
        </Link>
        {isClient ? (
          <Link
            href="/client/my-projects"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            {dict.header.myProjects}
          </Link>
        ) : null}
        {isStudio ? (
          <Link href="/dashboard">
            <Button size="sm" variant={isClient ? "outline" : "default"}>
              {dict.header.studioDashboard}
            </Button>
          </Link>
        ) : null}
        <LogoutButton />
      </nav>
    );
  }

  return (
    <nav
      className="flex flex-wrap items-center justify-end gap-1 sm:gap-2 text-sm"
      aria-label="Main navigation"
    >
      <LanguageSwitcher dict={dict} className="hidden sm:inline-flex" />
      <Link
        href="/login"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        {dict.header.login}
      </Link>
      <Link href="/register">
        <Button size="sm">{dict.header.studioRegister}</Button>
      </Link>
    </nav>
  );
}
