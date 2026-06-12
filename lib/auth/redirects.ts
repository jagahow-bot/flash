import { isPlatformAdmin } from "@/lib/auth/platform-admin.server";
import type { User } from "@/types/user";
import {
  canAccessStudioPortal,
  canActAsClient,
} from "@/lib/auth/user-roles";

function isStudioRoute(path: string): boolean {
  return path === "/dashboard" || path.startsWith("/dashboard/");
}

function isPlatformRoute(path: string): boolean {
  return path === "/platform" || path.startsWith("/platform/");
}

export function getPostLoginRedirect(
  user: User,
  redirectTo?: string | null
): string {
  if (redirectTo?.startsWith("/")) {
    if (isPlatformRoute(redirectTo)) {
      if (isPlatformAdmin(user)) {
        return redirectTo;
      }
    } else if (isStudioRoute(redirectTo)) {
      if (canAccessStudioPortal(user)) {
        return user.studioId ? redirectTo : "/setup";
      }
    } else if (canActAsClient(user)) {
      return redirectTo;
    }
  }

  if (canAccessStudioPortal(user)) {
    return user.studioId ? "/dashboard" : "/setup";
  }

  if (canActAsClient(user)) {
    return "/client/my-projects";
  }

  return "/";
}

export function getRoleGuardRedirect(
  user: User,
  pathname: string
): string | null {
  if (!canAccessStudioPortal(user)) {
    return "/";
  }

  const hasStudio = Boolean(user.studioId);

  if (!hasStudio && pathname !== "/setup") {
    return "/setup";
  }

  if (hasStudio && pathname === "/setup") {
    return "/dashboard";
  }

  return null;
}
