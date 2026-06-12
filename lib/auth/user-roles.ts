import { normalizeUserEmail } from "@/lib/auth/normalize-user-email";
import { parsePreferredLocale } from "@/lib/i18n/parse-preferred-locale";
import type { User, UserRole } from "@/types/user";

export function resolvePrimaryRole(roles: UserRole[]): UserRole {
  if (roles.includes("admin")) {
    return "admin";
  }

  if (roles.includes("artist")) {
    return "artist";
  }

  if (roles.includes("platform_admin")) {
    return "platform_admin";
  }

  return "client";
}

export function getUserRoles(
  user: Pick<User, "role" | "roles"> | null | undefined
): UserRole[] {
  if (!user) {
    return [];
  }

  if (user.roles?.length) {
    return [...new Set(user.roles)];
  }

  return user.role ? [user.role] : [];
}

export function hasUserRole(
  user: Pick<User, "role" | "roles"> | null | undefined,
  role: UserRole
): boolean {
  return getUserRoles(user).includes(role);
}

export function canAccessStudioPortal(
  user: Pick<User, "role" | "roles"> | null | undefined
): boolean {
  return hasUserRole(user, "admin") || hasUserRole(user, "artist");
}

/** 客戶端預約：純客戶與工作室帳號皆可使用同一 Email */
export function canActAsClient(
  user: Pick<User, "role" | "roles"> | null | undefined
): boolean {
  return (
    hasUserRole(user, "client") ||
    hasUserRole(user, "admin") ||
    hasUserRole(user, "artist")
  );
}

export function canBindAsStudioArtist(
  user: Pick<User, "role" | "roles"> | null | undefined
): boolean {
  return canActAsClient(user);
}

export function normalizeUserRecord(
  uid: string,
  data: Record<string, unknown> | undefined,
  fallbackEmail = ""
): User | null {
  if (!data) {
    return null;
  }

  const roles = Array.isArray(data.roles)
    ? ([...new Set(data.roles)] as UserRole[])
    : typeof data.role === "string"
      ? [data.role as UserRole]
      : [];

  if (roles.length === 0) {
    return null;
  }

  const role = resolvePrimaryRole(roles);

  const firestoreEmail =
    typeof data.email === "string" ? normalizeUserEmail(data.email) : "";
  const authEmail = fallbackEmail ? normalizeUserEmail(fallbackEmail) : "";
  // Prefer verified Firebase Auth email — Firestore may be stale (e.g. after seed).
  const email = authEmail || firestoreEmail;

  return {
    uid,
    email,
    role,
    roles,
    studioId: typeof data.studioId === "string" ? data.studioId : undefined,
    preferredLocale: parsePreferredLocale(data.preferredLocale),
  };
}
