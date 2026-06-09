import type { UserRole } from "@/types/user";
import { STUDIO_ROLES } from "@/lib/auth/constants";

export function isStudioRole(
  role: UserRole
): role is (typeof STUDIO_ROLES)[number] {
  return STUDIO_ROLES.includes(role as (typeof STUDIO_ROLES)[number]);
}
