import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/auth/dashboard-shell";
import { isStudioBillingBlocked } from "@/lib/auth/require-active-billing";
import { getRoleGuardRedirect } from "@/lib/auth/redirects";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { BILLING_EXEMPT_ROUTES } from "@/lib/billing/constants";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "/dashboard";
  const roleRedirect = getRoleGuardRedirect(user, pathname);

  if (roleRedirect) {
    redirect(roleRedirect);
  }

  const isBillingExempt = BILLING_EXEMPT_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (user.studioId && !isBillingExempt) {
    const billingBlocked = await isStudioBillingBlocked(user.studioId);
    if (billingBlocked) {
      redirect("/billing");
    }
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
