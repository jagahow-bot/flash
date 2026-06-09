import type { Project } from "@/types/project";
import type {
  ProjectMessage,
  ProjectMessageAuthorRole,
} from "@/types/project-message";

export type DiscussionContext = "client" | "studio";

export function getOpponentAuthorRole(
  context: DiscussionContext
): ProjectMessageAuthorRole {
  return context === "client" ? "studio" : "client";
}

export function getDiscussionReadAt(
  project: Pick<Project, "clientDiscussionReadAt" | "studioDiscussionReadAt">,
  context: DiscussionContext
): Date | undefined {
  return context === "client"
    ? project.clientDiscussionReadAt
    : project.studioDiscussionReadAt;
}

export function isUnreadDiscussionMessage(
  message: Pick<ProjectMessage, "authorRole" | "createdAt">,
  context: DiscussionContext,
  readAt?: Date
): boolean {
  if (message.authorRole !== getOpponentAuthorRole(context)) {
    return false;
  }

  if (!readAt) {
    return true;
  }

  return message.createdAt.getTime() > readAt.getTime();
}

export function countUnreadDiscussionMessages(
  messages: ProjectMessage[],
  context: DiscussionContext,
  project: Pick<Project, "clientDiscussionReadAt" | "studioDiscussionReadAt">
): number {
  const readAt = getDiscussionReadAt(project, context);

  return messages.filter((message) =>
    isUnreadDiscussionMessage(message, context, readAt)
  ).length;
}
