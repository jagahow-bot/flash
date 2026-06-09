import { Suspense } from "react";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { getPostLoginRedirect } from "@/lib/auth/redirects";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";

export default async function RegisterPage() {
  const [user, dict] = await Promise.all([
    getAuthenticatedUser(),
    getAppDictionary(await getRequestLocale()),
  ]);

  if (user) {
    redirect(getPostLoginRedirect(user));
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <Suspense
        fallback={
          <p className="text-muted-foreground">{dict.common.loading}</p>
        }
      >
        <RegisterForm />
      </Suspense>
    </main>
  );
}
