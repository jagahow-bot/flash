import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getPostLoginRedirect } from "@/lib/auth/redirects";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";

export default async function LoginPage({
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
    redirect(getPostLoginRedirect(user, redirectTo));
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <Suspense
        fallback={
          <p className="text-muted-foreground">{dict.common.loading}</p>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
