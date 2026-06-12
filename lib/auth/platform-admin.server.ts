import { hasUserRole } from "@/lib/auth/user-roles";
import type { User } from "@/types/user";

function getPlatformAdminEmails(): string[] {
  return (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isPlatformAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  return getPlatformAdminEmails().includes(normalized);
}

export function isPlatformAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  if (hasUserRole(user, "platform_admin")) return true;

  const allowed = isPlatformAdminEmail(user.email);
  if (
    process.env.NODE_ENV === "development" &&
    !allowed &&
    getPlatformAdminEmails().length > 0
  ) {
    console.warn(
      "[platform-admin] Access denied for signed-in user",
      JSON.stringify({ userEmail: user.email || "(empty)" }),
    );
  }

  return allowed;
}
