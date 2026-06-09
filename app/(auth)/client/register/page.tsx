import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ClientAuthForm } from "@/components/auth/client-auth-form";
import { canActAsClient } from "@/lib/auth/user-roles";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";

export default async function ClientRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectTo } = await searchParams;
  const [user, dict] = await Promise.all([
    getAuthenticatedUser(),
    getAppDictionary(await getRequestLocale()),
  ]);

  if (user) {
    if (canActAsClient(user)) {
      redirect(redirectTo?.startsWith("/") ? redirectTo : "/");
    }

    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8">
      <Suspense
        fallback={
          <p className="text-muted-foreground">{dict.common.loading}</p>
        }
      >
        <ClientAuthForm mode="register" />
      </Suspense>
    </main>
  );
}
