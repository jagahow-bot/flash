import { redirect } from "next/navigation";
import { PlatformAccessDenied } from "@/components/platform/platform-access-denied";
import { PlatformAdminShell } from "@/components/platform/platform-admin-shell";
import { isPlatformAdmin } from "@/lib/auth/platform-admin.server";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?redirect=/platform");
  }

  if (!isPlatformAdmin(user)) {
    return <PlatformAccessDenied user={user} />;
  }

  return <PlatformAdminShell user={user}>{children}</PlatformAdminShell>;
}
