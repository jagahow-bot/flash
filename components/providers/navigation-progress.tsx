"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function isInternalNavigationLink(anchor: HTMLAnchorElement): boolean {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }

  try {
    const url = new URL(href, window.location.href);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [isNavigating, setIsNavigating] = useState(false);
  const routeKeyRef = useRef(`${pathname}?${search}`);

  useEffect(() => {
    const routeKey = `${pathname}?${search}`;
    if (routeKeyRef.current !== routeKey) {
      routeKeyRef.current = routeKey;
      setIsNavigating(false);
    }
  }, [pathname, search]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor || !isInternalNavigationLink(anchor)) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      try {
        const url = new URL(href, window.location.href);
        const nextRoute = `${url.pathname}${url.search}`;
        if (nextRoute === routeKeyRef.current) return;
        setIsNavigating(true);
      } catch {
        // ignore malformed href
      }
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  if (!isNavigating) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-0.5 overflow-hidden bg-primary/15"
      role="progressbar"
      aria-hidden="true"
    >
      <div className="navigation-progress-bar h-full w-1/3 bg-primary" />
    </div>
  );
}
