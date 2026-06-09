import type { Project } from "@/types/project";
import { getInboxProjectSize, truncateInboxText } from "@/lib/project/inbox-display";

const DESCRIPTION_MAX_LENGTH = 60;

export function getClientProjectSize(project: Project): string {
  return getInboxProjectSize(project);
}

export function getClientProjectDescription(project: Project): string | null {
  const description = project.intakeForm.description?.trim();
  if (!description) return null;
  return truncateInboxText(description, DESCRIPTION_MAX_LENGTH);
}
