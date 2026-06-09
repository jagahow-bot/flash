import { Suspense } from "react";
import { VerifyEmailPage } from "@/components/auth/verify-email-page";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";

export default async function ClientVerifyEmailPage() {
  const dict = await getAppDictionary(await getRequestLocale());

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">{dict.common.loading}</p>
        }
      >
        <VerifyEmailPage
          audience="client"
          homeHref="/"
          homeLabel={dict.common.home}
        />
      </Suspense>
    </main>
  );
}
