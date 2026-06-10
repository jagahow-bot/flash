"use client";

import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  useAppDictionary,
  useAppLocale,
} from "@/components/providers/locale-provider";
import { localePath } from "@/lib/i18n/config";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ClientSessionBar({ email }: { email: string }) {
  const dict = useAppDictionary();
  const locale = useAppLocale();
  const marketingHomeHref = localePath(locale);
  const cp = dict.clientPortal;
  const c = dict.common;

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span className="min-w-0 truncate text-muted-foreground">
        {cp.signedInAs}
        <span className="text-foreground">{email}</span>
      </span>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={marketingHomeHref}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          {c.home}
        </Link>
        <LogoutButton redirectTo={marketingHomeHref} />
      </div>
    </div>
  );
}
