import Link from "next/link";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";
import type { User } from "@/types/user";

export async function PlatformAccessDenied({ user }: { user: User }) {
  const dict = await getAppDictionary(await getRequestLocale());
  const pa = dict.platformAdmin;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">{pa.accessDeniedTitle}</h1>
      <p className="max-w-md text-muted-foreground">{pa.accessDeniedDescription}</p>
      <p className="text-sm text-muted-foreground">
        {pa.accessDeniedSignedInAs}{" "}
        <span className="font-medium text-foreground">{user.email}</span>
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/"
          className="rounded-lg border border-input px-4 py-2 text-sm transition-colors hover:bg-muted"
        >
          {dict.common.home}
        </Link>
        {user.studioId ? (
          <Link
            href="/dashboard"
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90"
          >
            {dict.shell.navHome}
          </Link>
        ) : null}
      </div>
    </main>
  );
}
