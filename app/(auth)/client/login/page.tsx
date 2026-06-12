import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ClientAuthForm } from "@/components/auth/client-auth-form";
import { getClientAuthStudioContext } from "@/lib/auth/client-auth-studio.server";
import { getPostLoginRedirect } from "@/lib/auth/redirects";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";

export default async function ClientLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; studio?: string }>;
}) {
  const { redirect: redirectTo, studio } = await searchParams;
  const [user, dict, studioContext] = await Promise.all([
    getAuthenticatedUser(),
    getAppDictionary(await getRequestLocale()),
    getClientAuthStudioContext(redirectTo, studio),
  ]);

  if (user) {
    redirect(getPostLoginRedirect(user, redirectTo));
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8">
      <Suspense
        fallback={
          <p className="text-muted-foreground">{dict.common.loading}</p>
        }
      >
        <ClientAuthForm mode="login" studioContext={studioContext} />
      </Suspense>
    </main>
  );
}
