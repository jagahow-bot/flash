import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/auth/dashboard-shell";
import { getRoleGuardRedirect } from "@/lib/auth/redirects";
import { getAuthenticatedUser } from "@/lib/auth/session";

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

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
