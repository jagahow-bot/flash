"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useAppLocale } from "@/components/providers/locale-provider";
import { isLocale, type Locale } from "@/lib/i18n/config";
import {
  LOCALE_CHANGE_EVENT,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
} from "@/lib/i18n/locale-cookie";

function readLocaleCookie(): Locale | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)`),
  );
  const value = match?.[1] ? decodeURIComponent(match[1]) : null;
  return value && isLocale(value) ? value : null;
}

function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};SameSite=Lax`;
}

export function LocaleSync() {
  const { firebaseUser, loading } = useAuth();
  const serverLocale = useAppLocale();
  const router = useRouter();
  const syncedUid = useRef<string | null>(null);
  const refreshedForCookie = useRef(false);

  useEffect(() => {
    if (refreshedForCookie.current) {
      return;
    }

    const cookieLocale = readLocaleCookie();
    if (cookieLocale && cookieLocale !== serverLocale) {
      refreshedForCookie.current = true;
      router.refresh();
    }
  }, [router, serverLocale]);

  useEffect(() => {
    function handleLocaleCookieChange() {
      router.refresh();
    }

    window.addEventListener(LOCALE_CHANGE_EVENT, handleLocaleCookieChange);
    return () =>
      window.removeEventListener(LOCALE_CHANGE_EVENT, handleLocaleCookieChange);
  }, [router]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!firebaseUser) {
      syncedUid.current = null;
      return;
    }

    if (syncedUid.current === firebaseUser.uid) {
      return;
    }

    let cancelled = false;

    async function syncFromProfile() {
      try {
        const response = await fetch("/api/user/locale");
        if (!response.ok || cancelled) {
          return;
        }

        const data = (await response.json()) as { locale?: string | null };
        const profileLocale =
          data.locale && isLocale(data.locale) ? data.locale : null;
        const cookieLocale = readLocaleCookie();

        if (!profileLocale && cookieLocale && !cancelled) {
          const patchResponse = await fetch("/api/user/locale", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ locale: cookieLocale }),
          });
          if (patchResponse.ok && !cancelled) {
            router.refresh();
          }
          syncedUid.current = firebaseUser!.uid;
          return;
        }

        if (!profileLocale || cancelled) {
          syncedUid.current = firebaseUser!.uid;
          return;
        }

        // Only seed cookie from profile when none exists — do not clobber an
        // explicit choice from the language switcher (cookie vs profile mismatch).
        if (!cookieLocale) {
          setLocaleCookie(profileLocale);
          router.refresh();
        }

        syncedUid.current = firebaseUser!.uid;
      } catch {
        // Ignore sync errors; cookie fallback still applies.
      }
    }

    void syncFromProfile();

    return () => {
      cancelled = true;
    };
  }, [firebaseUser, loading, router]);

  return null;
}
