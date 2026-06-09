import { canAccessStudioPortal } from "@/lib/auth/user-roles";
import type { DiscussionContext } from "@/lib/project/discussion-read";
import { canClientAccessProject } from "@/lib/project/client-access";
import type { Project } from "@/types/project";
import type { User } from "@/types/user";

export function resolveDiscussionAuthorRole(
  context: DiscussionContext,
  project: Project,
  studioUser: User | null,
  clientUser: User | null
): "client" | "studio" | null {
  if (context === "client") {
    if (clientUser && canClientAccessProject(project, clientUser)) {
      return "client";
    }

    return null;
  }

  if (
    studioUser?.studioId === project.studioId &&
    canAccessStudioPortal(studioUser)
  ) {
    return "studio";
  }

  return null;
}
