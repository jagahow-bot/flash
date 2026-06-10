import { isUserEmailVerified } from "@/lib/auth/email-verified.server";
import { canAccessStudioPortal } from "@/lib/auth/user-roles";
import { resolveRecipientLocale } from "@/lib/email/resolve-recipient-locale.server";
import type { NotificationRecipient } from "@/lib/email/send-localized.server";
import { isGuestClientProject } from "@/lib/project/client-access";
import { getUserById, getStudioPortalUsers } from "@/lib/firestore/users.server";
import type { Project } from "@/types/project";

export async function getClientNotificationEmail(
  project: Project
): Promise<string | null> {
  const recipient = await getClientNotificationRecipient(project);
  return recipient?.email ?? null;
}

export async function getClientNotificationRecipient(
  project: Project
): Promise<NotificationRecipient | null> {
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

  return {
    email: user.email,
    locale: resolveRecipientLocale(user),
  };
}

export async function getStudioNotificationEmails(
  studioId: string
): Promise<string[]> {
  const recipients = await getStudioNotificationRecipients(studioId);
  return recipients.map((recipient) => recipient.email);
}

export async function getStudioNotificationRecipients(
  studioId: string
): Promise<NotificationRecipient[]> {
  const users = await getStudioPortalUsers(studioId);
  const recipients: NotificationRecipient[] = [];

  for (const user of users) {
    if (!user.email || !canAccessStudioPortal(user)) {
      continue;
    }

    const verified = await isUserEmailVerified(user.uid);
    if (verified) {
      recipients.push({
        email: user.email,
        locale: resolveRecipientLocale(user),
      });
    }
  }

  const unique = new Map<string, NotificationRecipient>();
  for (const recipient of recipients) {
    unique.set(recipient.email.toLowerCase(), recipient);
  }

  return [...unique.values()];
}
