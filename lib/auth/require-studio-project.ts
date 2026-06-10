import { isStudioBillingBlocked } from "@/lib/auth/require-active-billing";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { canAccessStudioPortal } from "@/lib/auth/user-roles";
import { getProjectById } from "@/lib/firestore/projects.server";
import type { Project } from "@/types/project";
import type { User } from "@/types/user";

export async function requireStudioProjectAccess(
  projectId: string
): Promise<{ user: User; project: Project } | null> {
  const user = await getAuthenticatedUser();

  if (!user?.studioId || !canAccessStudioPortal(user)) {
    return null;
  }

  if (await isStudioBillingBlocked(user.studioId)) {
    return null;
  }

  const project = await getProjectById(projectId);

  if (!project || project.studioId !== user.studioId) {
    return null;
  }

  return { user, project };
}
