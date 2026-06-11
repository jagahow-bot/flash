import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";

export default async function StudioNotFound() {
  const dict = await getAppDictionary(await getRequestLocale());

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        {dict.booking.studioNotFound}
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {dict.booking.storefrontDescriptionFallback}
      </p>
      <Link href="/">
        <Button variant="outline">{dict.common.home}</Button>
      </Link>
    </main>
  );
}
