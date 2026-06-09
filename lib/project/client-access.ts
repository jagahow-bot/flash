import { canActAsClient } from "@/lib/auth/user-roles";
import type { Project } from "@/types/project";
import type { User } from "@/types/user";

export function isGuestClientProject(project: Project): boolean {
  return project.clientId.startsWith("guest_");
}

export function canClientAccessProject(
  project: Project,
  user: User | null
): boolean {
  if (isGuestClientProject(project)) {
    return true;
  }

  return Boolean(
    user && canActAsClient(user) && user.uid === project.clientId
  );
}
