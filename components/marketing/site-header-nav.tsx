"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const homeHref = localePath(dict.locale);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileOpen]);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  const desktopNavClass =
    "hidden items-center justify-end gap-1 text-sm md:flex md:gap-2";
  const mobileLinkClass = "w-full justify-center";

  if (isAuthenticated) {
    return (
      <div className="relative">
        <nav className={desktopNavClass} aria-label="Main navigation">
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
          <LogoutButton redirectTo={homeHref} />
        </nav>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="site-header-mobile-nav"
          aria-label="Main navigation menu"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>

        {mobileOpen ? (
          <nav
            id="site-header-mobile-nav"
            className="absolute right-0 top-full z-50 mt-2 flex w-56 flex-col gap-1 rounded-lg border bg-background p-2 shadow-lg md:hidden"
            aria-label="Main navigation"
          >
            <Link
              href={homeHref}
              onClick={closeMobileMenu}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                mobileLinkClass
              )}
            >
              {dict.header.home}
            </Link>
            {isClient ? (
              <Link
                href="/client/my-projects"
                onClick={closeMobileMenu}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  mobileLinkClass
                )}
              >
                {dict.header.myProjects}
              </Link>
            ) : null}
            {isStudio ? (
              <Link href="/dashboard" onClick={closeMobileMenu} className="w-full">
                <Button
                  size="sm"
                  variant={isClient ? "outline" : "default"}
                  className="w-full"
                >
                  {dict.header.studioDashboard}
                </Button>
              </Link>
            ) : null}
            <LogoutButton redirectTo={homeHref} className="w-full" />
          </nav>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative">
      <nav className={desktopNavClass} aria-label="Main navigation">
        <LanguageSwitcher dict={dict} className="hidden sm:inline-flex" />
        <Link
          href="/login"
          prefetch={false}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          {dict.header.login}
        </Link>
        <Link href="/register" prefetch={false}>
          <Button size="sm">{dict.header.studioRegister}</Button>
        </Link>
      </nav>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        aria-expanded={mobileOpen}
        aria-controls="site-header-mobile-nav"
        aria-label="Main navigation menu"
        onClick={() => setMobileOpen((open) => !open)}
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {mobileOpen ? (
        <nav
          id="site-header-mobile-nav"
          className="absolute right-0 top-full z-50 mt-2 flex w-56 flex-col gap-1 rounded-lg border bg-background p-2 shadow-lg md:hidden"
          aria-label="Main navigation"
        >
          <Link
            href="/login"
            prefetch={false}
            onClick={closeMobileMenu}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              mobileLinkClass
            )}
          >
            {dict.header.login}
          </Link>
          <Link
            href="/register"
            prefetch={false}
            onClick={closeMobileMenu}
            className="w-full"
          >
            <Button size="sm" className="w-full">
              {dict.header.studioRegister}
            </Button>
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
