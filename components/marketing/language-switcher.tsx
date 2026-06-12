"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import {
  blogPathFromPathname,
  defaultLocale,
  isBlogPath,
  isLocaleFromUrlPath,
  localeFromPathname,
  localeHrefLang,
  localeLabels,
  localePath,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import {
  LOCALE_CHANGE_EVENT,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
} from "@/lib/i18n/locale-cookie";
import type { LandingDictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

function isDefaultMarketingRoot(pathname: string): boolean {
  return pathname === "/" || pathname === "";
}

function readLocaleCookie(): Locale | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)`),
  );
  const value = match?.[1] ? decodeURIComponent(match[1]) : null;
  return value && locales.includes(value as Locale) ? (value as Locale) : null;
}

function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};SameSite=Lax`;
  notifyLocaleCookieChange();
}

function subscribeToLocaleCookie(onStoreChange: () => void) {
  window.addEventListener(LOCALE_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(LOCALE_CHANGE_EVENT, onStoreChange);
}

function notifyLocaleCookieChange() {
  window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
}

function useCookieLocale(): Locale | null {
  return useSyncExternalStore(
    subscribeToLocaleCookie,
    () => readLocaleCookie(),
    () => null,
  );
}

async function persistLocaleToProfile(locale: Locale): Promise<void> {
  try {
    await fetch("/api/user/locale", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
  } catch {
    // Anonymous users or network errors still keep the cookie.
  }
}

export function LanguageSwitcher({
  dict,
  className,
}: {
  dict: LandingDictionary;
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const urlLocalePath = isLocaleFromUrlPath(pathname);
  const pathLocale = localeFromPathname(pathname);
  const cookieLocale = useCookieLocale();
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const userLocaleChangeRef = useRef(false);

  const resolvedLocale: Locale = urlLocalePath
    ? isDefaultMarketingRoot(pathname)
      ? (cookieLocale ?? defaultLocale)
      : pathLocale
    : (cookieLocale ?? defaultLocale);

  if (pendingLocale && pendingLocale === resolvedLocale) {
    setPendingLocale(null);
  }

  const currentLocale = pendingLocale ?? resolvedLocale;

  useEffect(() => {
    if (userLocaleChangeRef.current) {
      return;
    }
    if (urlLocalePath && !isDefaultMarketingRoot(pathname)) {
      setLocaleCookie(pathLocale);
      void persistLocaleToProfile(pathLocale);
    }
  }, [urlLocalePath, pathLocale, pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleAppLocaleChange(locale: Locale) {
    setLocaleCookie(locale);
    setPendingLocale(locale);
    setOpen(false);
    // Logged-in users: server prefers Firestore over cookie — wait for PATCH
    // before refresh, otherwise the first switch appears to do nothing.
    await persistLocaleToProfile(locale);
    router.refresh();
  }

  async function handleUrlLocaleChange(locale: Locale) {
    userLocaleChangeRef.current = true;
    setLocaleCookie(locale);
    setPendingLocale(locale);
    setOpen(false);
    await persistLocaleToProfile(locale);
    const href = isBlogPath(pathname)
      ? localePath(locale, blogPathFromPathname(pathname))
      : localePath(locale);
    if (pathname === href) {
      router.refresh();
      userLocaleChangeRef.current = false;
    } else {
      router.push(href);
    }
  }

  useEffect(() => {
    if (!userLocaleChangeRef.current || !pendingLocale) {
      return;
    }
    const pathLocaleAfterNav = localeFromPathname(pathname);
    if (pathLocaleAfterNav === pendingLocale) {
      userLocaleChangeRef.current = false;
    }
  }, [pathname, pendingLocale]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${dict.header.language}: ${localeLabels[currentLocale]}`}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Globe className="size-4 shrink-0" aria-hidden="true" />
        <span>{localeLabels[currentLocale]}</span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label={dict.header.language}
          className="absolute right-0 top-full z-50 mt-1 min-w-[10rem] rounded-md border bg-popover py-1 shadow-md"
        >
          {locales.map((locale) => {
            const isActive = locale === currentLocale;
            const hrefLang = localeHrefLang[locale];

            if (urlLocalePath) {
              return (
                <li key={locale} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    lang={hrefLang}
                    onClick={() => handleUrlLocaleChange(locale)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                      isActive && "font-medium text-foreground",
                    )}
                  >
                    <span>{localeLabels[locale]}</span>
                    {isActive ? (
                      <Check className="size-4 shrink-0" aria-hidden="true" />
                    ) : null}
                  </button>
                </li>
              );
            }

            return (
              <li key={locale} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  lang={hrefLang}
                  onClick={() => handleAppLocaleChange(locale)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                    isActive && "font-medium text-foreground",
                  )}
                >
                  <span>{localeLabels[locale]}</span>
                  {isActive ? (
                    <Check className="size-4 shrink-0" aria-hidden="true" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
