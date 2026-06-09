import { isUserEmailVerified } from "@/lib/auth/email-verified.server";
import { canAccessStudioPortal } from "@/lib/auth/user-roles";
import { isGuestClientProject } from "@/lib/project/client-access";
import { getUserById, getStudioPortalUsers } from "@/lib/firestore/users.server";
import type { Project } from "@/types/project";

export async function getClientNotificationEmail(
  project: Project
): Promise<string | null> {
  if (isGuestClientProject(project)) {
    return null;
  }

  const user = await getUserById(project.clientId);
  if (!user?.email) {
    return null;
  }

  const verified = await isUserEmailVerified(project.clientId);
  if (!verified) {
    return null;
  }

  return user.email;
}

export async function getStudioNotificationEmails(
  studioId: string
): Promise<string[]> {
  const users = await getStudioPortalUsers(studioId);
  const emails: string[] = [];

  for (const user of users) {
    if (!user.email || !canAccessStudioPortal(user)) {
      continue;
    }

    const verified = await isUserEmailVerified(user.uid);
    if (verified) {
      emails.push(user.email);
    }
  }

  return [...new Set(emails)];
}
