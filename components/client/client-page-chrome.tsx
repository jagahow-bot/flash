"use client";

import Link from "next/link";
import { ClientLocaleSwitcher } from "@/components/client/client-locale-switcher";
import { useAppDictionary } from "@/components/providers/locale-provider";

export function ClientPageChrome() {
  const dict = useAppDictionary();

  return (
    <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-2xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight"
          aria-label="FLASH home"
        >
          {dict.common.brand}
        </Link>
        <ClientLocaleSwitcher />
      </div>
    </div>
  );
}
