import { buildProjectEmail } from "@/lib/email/templates/project-notifications";
import {
  getClientNotificationRecipient,
  getStudioNotificationRecipients,
} from "@/lib/email/recipients.server";
import {
  sendLocalizedToRecipient,
  sendLocalizedToRecipients,
} from "@/lib/email/send-localized.server";
import type { ResolvedAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { formatMessage } from "@/lib/i18n/format";
import { getStudioById } from "@/lib/firestore/studios.server";
import { formatDepositDeadline } from "@/lib/project/format";
import { getClientDisplayName } from "@/lib/project/client-display";
import { getActiveProjectTimeSlot } from "@/lib/project/active-session-state";
import {
  formatSessionSlotLabel,
  getCurrentSessionIndex,
  getTotalSessions,
  hasMoreSessionsToBook,
} from "@/lib/project/session-schedule";
import { getUserById } from "@/lib/firestore/users.server";
import type { PreSessionCompletionMethod } from "@/types/pre-session-document";
import type { Project } from "@/types/project";
import type { ProjectMessageAuthorRole } from "@/types/project-message";
import type { SessionDetails, TimeSlot } from "@/types/session-details";
import type { Studio } from "@/types/studio";

export type ProjectNotificationEvent =
  | "new_intake"
  | "new_discussion_message"
  | "quote_ready"
  | "quote_updated"
  | "deposit_submitted"
  | "slot_reserved"
  | "deposit_deadline_expired"
  | "deposit_confirmed"
  | "next_session_ready"
  | "sketches_uploaded"
  | "final_photos_uploaded"
  | "project_completed"
  | "pre_session_document_completed";

function serializeSlot(slot: TimeSlot): string {
  return `${new Date(slot.startTime).getTime()}-${new Date(slot.endTime).getTime()}`;
}

export function sessionDetailsChanged(
  previous: SessionDetails | undefined,
  next: SessionDetails | undefined
): boolean {
  if (!next) return false;
  if (!previous) return true;

  return (
    previous.sessions !== next.sessions ||
    previous.hoursPerSession !== next.hoursPerSession ||
    String(previous.totalPrice) !== String(next.totalPrice) ||
    String(previous.depositRequired) !== String(next.depositRequired)
  );
}

export function proposedSlotsChanged(
  previous: TimeSlot[] | undefined,
  next: TimeSlot[] | undefined
): boolean {
  const prev = previous ?? [];
  const nextSlots = next ?? [];

  if (prev.length !== nextSlots.length) return true;

  const known = new Set(prev.map(serializeSlot));
  return nextSlots.some((slot) => !known.has(serializeSlot(slot)));
}

function getNewUrls(previous: string[], next: string[]): string[] {
  const known = new Set(previous);
  return next.filter((url) => !known.has(url));
}

async function resolveStudioContext(project: Project) {
  const studio = await getStudioById(project.studioId);
  if (!studio?.slug) {
    return null;
  }

  return { studio };
}

function dispatch(
  promise: Promise<unknown>,
  event: ProjectNotificationEvent,
  projectId: string
) {
  void promise.catch((error) => {
    console.error(`[email] ${event} failed for ${projectId}:`, error);
  });
}

function formatCountHint(dict: ResolvedAppDictionary, count: number): string {
  if (count <= 1) {
    return "";
  }

  return formatMessage(dict.email.countHint, { count });
}

function formatQuoteSessionHint(
  dict: ResolvedAppDictionary,
  project: Project
): string {
  const sessionIndex = project.currentSessionIndex ?? 1;
  const totalSessions = project.sessionDetails?.sessions ?? 1;

  if (totalSessions <= 1) {
    return "";
  }

  return formatMessage(dict.email.quoteSessionHint, {
    sessionIndex,
    totalSessions,
  });
}

function buildQuoteNotificationCopy(
  dict: ResolvedAppDictionary,
  studioName: string,
  project: Project,
  input: { quoteChanged: boolean; slotsChanged: boolean; isFirstSend: boolean }
) {
  const sessionHint = formatQuoteSessionHint(dict, project);
  const values = { studioName, sessionHint };

  if (input.isFirstSend) {
    return {
      title: dict.email.quoteFirstSend.title,
      body: formatMessage(dict.email.quoteFirstSend.body, values),
    };
  }

  if (input.quoteChanged && input.slotsChanged) {
    return {
      title: dict.email.quoteUpdatedBoth.title,
      body: formatMessage(dict.email.quoteUpdatedBoth.body, values),
    };
  }

  if (input.slotsChanged) {
    return {
      title: dict.email.quoteSlotsUpdated.title,
      body: formatMessage(dict.email.quoteSlotsUpdated.body, values),
    };
  }

  return {
    title: dict.email.quotePriceUpdated.title,
    body: formatMessage(dict.email.quotePriceUpdated.body, values),
  };
}

function buildProjectEmailForAudience(
  dict: ResolvedAppDictionary,
  input: {
    studioName: string;
    projectId: string;
    studioSlug: string;
    audience: "client" | "studio";
    title: string;
    body: string;
  }
) {
  return buildProjectEmail({
    dict,
    locale: dict.locale,
    ...input,
  });
}

export function notifyNewIntake(project: Project) {
  dispatch(
    (async () => {
      const context = await resolveStudioContext(project);
      if (!context) return;

      const recipients = await getStudioNotificationRecipients(project.studioId);
      if (recipients.length === 0) return;

      const clientUser = await getUserById(project.clientId);

      await sendLocalizedToRecipients(recipients, (dict) => {
        const clientName = getClientDisplayName(
          project,
          clientUser,
          dict.project,
        );

        return buildProjectEmailForAudience(dict, {
          studioName: context.studio.name,
          projectId: project.projectId,
          studioSlug: context.studio.slug,
          audience: "studio",
          title: dict.email.newIntake.title,
          body: formatMessage(dict.email.newIntake.body, {
            clientName,
            projectId: project.projectId,
          }),
        });
      });
    })(),
    "new_intake",
    project.projectId
  );
}

export function notifyNewDiscussionMessage(
  project: Project,
  input: {
    authorRole: ProjectMessageAuthorRole;
    authorLabel: string;
    body: string;
  }
) {
  dispatch(
    (async () => {
      const context = await resolveStudioContext(project);
      if (!context) return;

      const preview =
        input.body.length > 120 ? `${input.body.slice(0, 120)}…` : input.body;

      if (input.authorRole === "client") {
        const recipients = await getStudioNotificationRecipients(
          project.studioId
        );
        if (recipients.length === 0) return;

        await sendLocalizedToRecipients(recipients, (dict) =>
          buildProjectEmailForAudience(dict, {
            studioName: context.studio.name,
            projectId: project.projectId,
            studioSlug: context.studio.slug,
            audience: "studio",
            title: dict.email.discussionClientMessage.title,
            body: formatMessage(dict.email.discussionClientMessage.body, {
              authorLabel: input.authorLabel,
              projectId: project.projectId,
              preview,
            }),
          })
        );
        return;
      }

      const recipient = await getClientNotificationRecipient(project);
      if (!recipient) return;

      await sendLocalizedToRecipient(recipient, (dict) =>
        buildProjectEmailForAudience(dict, {
          studioName: context.studio.name,
          projectId: project.projectId,
          studioSlug: context.studio.slug,
          audience: "client",
          title: dict.email.discussionStudioReply.title,
          body: formatMessage(dict.email.discussionStudioReply.body, {
            studioName: context.studio.name,
            projectId: project.projectId,
            preview,
          }),
        })
      );
    })(),
    "new_discussion_message",
    project.projectId
  );
}

export function notifyQuoteProgressUpdate(
  project: Project,
  input: { quoteChanged: boolean; slotsChanged: boolean; isFirstSend: boolean }
) {
  if (!input.quoteChanged && !input.slotsChanged) return;

  const event: ProjectNotificationEvent = input.isFirstSend
    ? "quote_ready"
    : "quote_updated";

  dispatch(
    (async () => {
      const context = await resolveStudioContext(project);
      if (!context) return;

      const recipient = await getClientNotificationRecipient(project);
      if (!recipient) return;

      await sendLocalizedToRecipient(recipient, (dict) => {
        const copy = buildQuoteNotificationCopy(
          dict,
          context.studio.name,
          project,
          input
        );

        return buildProjectEmailForAudience(dict, {
          studioName: context.studio.name,
          projectId: project.projectId,
          studioSlug: context.studio.slug,
          audience: "client",
          title: copy.title,
          body: copy.body,
        });
      });
    })(),
    event,
    project.projectId
  );
}

export function notifySlotReserved(project: Project, studio: Studio) {
  dispatch(
    (async () => {
      const clientRecipient = await getClientNotificationRecipient(project);
      const slot = getActiveProjectTimeSlot(project);

      if (!clientRecipient || !slot || !project.depositDeadlineAt) {
        return;
      }

      await sendLocalizedToRecipient(clientRecipient, async (dict) => {
        const slotLabel = formatSessionSlotLabel(
          project,
          slot,
          getCurrentSessionIndex(project),
          dict,
        );
        const deadlineLabel = formatDepositDeadline(
          project.depositDeadlineAt!,
          dict.dates,
        );

        return buildProjectEmailForAudience(dict, {
          studioName: studio.name,
          projectId: project.projectId,
          studioSlug: studio.slug,
          audience: "client",
          title: dict.email.slotReservedClient.title,
          body: formatMessage(dict.email.slotReservedClient.body, {
            slotLabel,
            deadlineLabel,
          }),
        });
      });

      const studioRecipients = await getStudioNotificationRecipients(
        project.studioId
      );
      if (studioRecipients.length === 0) {
        return;
      }

      const clientUser = await getUserById(project.clientId);

      await sendLocalizedToRecipients(studioRecipients, async (dict) => {
        const slotLabel = formatSessionSlotLabel(
          project,
          slot,
          getCurrentSessionIndex(project),
          dict,
        );
        const deadlineLabel = formatDepositDeadline(
          project.depositDeadlineAt!,
          dict.dates,
        );
        const clientName = getClientDisplayName(
          project,
          clientUser,
          dict.project,
        );

        return buildProjectEmailForAudience(dict, {
          studioName: studio.name,
          projectId: project.projectId,
          studioSlug: studio.slug,
          audience: "studio",
          title: dict.email.slotReservedStudio.title,
          body: formatMessage(dict.email.slotReservedStudio.body, {
            clientName,
            slotLabel,
            deadlineLabel,
          }),
        });
      });
    })(),
    "slot_reserved",
    project.projectId
  );
}

export function notifyDepositDeadlineExpired(
  project: Project,
  studio: Studio
) {
  dispatch(
    (async () => {
      const clientRecipient = await getClientNotificationRecipient(project);
      const studioRecipients = await getStudioNotificationRecipients(
        project.studioId
      );

      if (clientRecipient) {
        await sendLocalizedToRecipient(clientRecipient, (dict) =>
          buildProjectEmailForAudience(dict, {
            studioName: studio.name,
            projectId: project.projectId,
            studioSlug: studio.slug,
            audience: "client",
            title: dict.email.depositExpiredClient.title,
            body: formatMessage(dict.email.depositExpiredClient.body, {
              projectId: project.projectId,
            }),
          })
        );
      }

      if (studioRecipients.length > 0) {
        await sendLocalizedToRecipients(studioRecipients, (dict) =>
          buildProjectEmailForAudience(dict, {
            studioName: studio.name,
            projectId: project.projectId,
            studioSlug: studio.slug,
            audience: "studio",
            title: dict.email.depositExpiredStudio.title,
            body: formatMessage(dict.email.depositExpiredStudio.body, {
              projectId: project.projectId,
            }),
          })
        );
      }
    })(),
    "deposit_deadline_expired",
    project.projectId
  );
}

export function notifyDepositSubmitted(project: Project) {
  dispatch(
    (async () => {
      const context = await resolveStudioContext(project);
      if (!context) return;

      const recipients = await getStudioNotificationRecipients(project.studioId);
      if (recipients.length === 0) return;

      const clientUser = await getUserById(project.clientId);

      await sendLocalizedToRecipients(recipients, (dict) => {
        const clientName = getClientDisplayName(
          project,
          clientUser,
          dict.project,
        );

        return buildProjectEmailForAudience(dict, {
          studioName: context.studio.name,
          projectId: project.projectId,
          studioSlug: context.studio.slug,
          audience: "studio",
          title: dict.email.depositSubmitted.title,
          body: formatMessage(dict.email.depositSubmitted.body, {
            clientName,
            projectId: project.projectId,
          }),
        });
      });
    })(),
    "deposit_submitted",
    project.projectId
  );
}

export function notifySketchesUploaded(
  project: Project,
  input: { newCount: number }
) {
  if (input.newCount <= 0) return;

  dispatch(
    (async () => {
      const context = await resolveStudioContext(project);
      if (!context) return;

      const recipient = await getClientNotificationRecipient(project);
      if (!recipient) return;

      await sendLocalizedToRecipient(recipient, (dict) =>
        buildProjectEmailForAudience(dict, {
          studioName: context.studio.name,
          projectId: project.projectId,
          studioSlug: context.studio.slug,
          audience: "client",
          title: dict.email.sketchesUploaded.title,
          body: formatMessage(dict.email.sketchesUploaded.body, {
            studioName: context.studio.name,
            projectId: project.projectId,
            countHint: formatCountHint(dict, input.newCount),
          }),
        })
      );
    })(),
    "sketches_uploaded",
    project.projectId
  );
}

export function notifyFinalPhotosUploaded(
  project: Project,
  input: { newCount: number }
) {
  if (input.newCount <= 0) return;

  dispatch(
    (async () => {
      const context = await resolveStudioContext(project);
      if (!context) return;

      const recipient = await getClientNotificationRecipient(project);
      if (!recipient) return;

      await sendLocalizedToRecipient(recipient, (dict) =>
        buildProjectEmailForAudience(dict, {
          studioName: context.studio.name,
          projectId: project.projectId,
          studioSlug: context.studio.slug,
          audience: "client",
          title: dict.email.finalPhotosUploaded.title,
          body: formatMessage(dict.email.finalPhotosUploaded.body, {
            studioName: context.studio.name,
            projectId: project.projectId,
            countHint: formatCountHint(dict, input.newCount),
          }),
        })
      );
    })(),
    "final_photos_uploaded",
    project.projectId
  );
}

export function notifyProjectAssetsUploaded(
  project: Project,
  previous: Pick<Project, "sketches" | "finalPhotos">
) {
  const newSketches = getNewUrls(previous.sketches, project.sketches);
  const newFinalPhotos = getNewUrls(previous.finalPhotos, project.finalPhotos);

  notifySketchesUploaded(project, { newCount: newSketches.length });
  notifyFinalPhotosUploaded(project, { newCount: newFinalPhotos.length });
}

export function notifyProjectCompleted(project: Project) {
  dispatch(
    (async () => {
      const context = await resolveStudioContext(project);
      if (!context) return;

      const recipient = await getClientNotificationRecipient(project);
      if (!recipient) return;

      await sendLocalizedToRecipient(recipient, (dict) =>
        buildProjectEmailForAudience(dict, {
          studioName: context.studio.name,
          projectId: project.projectId,
          studioSlug: context.studio.slug,
          audience: "client",
          title: dict.email.projectCompleted.title,
          body: formatMessage(dict.email.projectCompleted.body, {
            studioName: context.studio.name,
            projectId: project.projectId,
          }),
        })
      );
    })(),
    "project_completed",
    project.projectId
  );
}

export function notifyDepositConfirmed(project: Project) {
  dispatch(
    (async () => {
      const context = await resolveStudioContext(project);
      if (!context) return;

      const recipient = await getClientNotificationRecipient(project);
      if (!recipient) return;

      await sendLocalizedToRecipient(recipient, (dict) => {
        const sessionIndex = getCurrentSessionIndex(project);
        const hasMoreSessions = hasMoreSessionsToBook(project);
        const template = hasMoreSessions
          ? dict.email.depositConfirmedMulti
          : dict.email.depositConfirmedSingle;

        return buildProjectEmailForAudience(dict, {
          studioName: context.studio.name,
          projectId: project.projectId,
          studioSlug: context.studio.slug,
          audience: "client",
          title: template.title,
          body: formatMessage(template.body, {
            studioName: context.studio.name,
            projectId: project.projectId,
            sessionIndex,
          }),
        });
      });
    })(),
    "deposit_confirmed",
    project.projectId
  );
}

export function notifySessionDeliveryComplete(project: Project) {
  dispatch(
    (async () => {
      const context = await resolveStudioContext(project);
      if (!context) return;

      const recipient = await getClientNotificationRecipient(project);
      if (!recipient) return;

      await sendLocalizedToRecipient(recipient, (dict) => {
        const sessionIndex = getCurrentSessionIndex(project);
        const totalSessions = getTotalSessions(project);
        const template =
          totalSessions > 1
            ? dict.email.nextSessionReadyMulti
            : dict.email.nextSessionReadySingle;

        return buildProjectEmailForAudience(dict, {
          studioName: context.studio.name,
          projectId: project.projectId,
          studioSlug: context.studio.slug,
          audience: "client",
          title: template.title,
          body: formatMessage(template.body, {
            studioName: context.studio.name,
            sessionIndex,
            previousSession: sessionIndex - 1,
          }),
        });
      });
    })(),
    "next_session_ready",
    project.projectId
  );
}

export function notifyPreSessionDocumentCompleted(
  project: Project,
  studio: Studio,
  input: {
    documentTitle: string;
    completionMethod: PreSessionCompletionMethod;
  }
) {
  dispatch(
    (async () => {
      if (input.completionMethod === "client_signature") {
        const recipients = await getStudioNotificationRecipients(
          project.studioId
        );
        if (recipients.length === 0) return;

        const clientUser = await getUserById(project.clientId);

        await sendLocalizedToRecipients(recipients, (dict) => {
          const clientName = getClientDisplayName(
            project,
            clientUser,
            dict.project,
          );

          return buildProjectEmailForAudience(dict, {
            studioName: studio.name,
            projectId: project.projectId,
            studioSlug: studio.slug,
            audience: "studio",
            title: dict.email.preSessionSignedStudio.title,
            body: formatMessage(dict.email.preSessionSignedStudio.body, {
              clientName,
              documentTitle: input.documentTitle,
              projectId: project.projectId,
            }),
          });
        });
        return;
      }

      const recipient = await getClientNotificationRecipient(project);
      if (!recipient) return;

      await sendLocalizedToRecipient(recipient, (dict) =>
        buildProjectEmailForAudience(dict, {
          studioName: studio.name,
          projectId: project.projectId,
          studioSlug: studio.slug,
          audience: "client",
          title: dict.email.preSessionArchivedClient.title,
          body: formatMessage(dict.email.preSessionArchivedClient.body, {
            studioName: studio.name,
            documentTitle: input.documentTitle,
            projectId: project.projectId,
          }),
        })
      );
    })(),
    "pre_session_document_completed",
    project.projectId
  );
}
