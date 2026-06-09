import { buildProjectEmail } from "@/lib/email/templates/project-notifications";
import {
  getClientNotificationEmail,
  getStudioNotificationEmails,
} from "@/lib/email/recipients.server";
import { sendEmail } from "@/lib/email/send.server";
import { defaultLocale } from "@/lib/i18n/config";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
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

export function notifyNewIntake(project: Project) {
  dispatch(
    (async () => {
      const context = await resolveStudioContext(project);
      if (!context) return;

      const recipients = await getStudioNotificationEmails(project.studioId);
      if (recipients.length === 0) return;

      const dict = await getAppDictionary(defaultLocale);
      const clientUser = await getUserById(project.clientId);
      const clientName = getClientDisplayName(
        project,
        clientUser,
        dict.project,
      );
      const email = buildProjectEmail({
        studioName: context.studio.name,
        projectId: project.projectId,
        studioSlug: context.studio.slug,
        audience: "studio",
        title: "收到新的預約需求",
        body: `${clientName} 已送出預約需求（${project.projectId}），請至後台查看 FLASH 需求摘要並開始報價。`,
      });

      await sendEmail({ to: recipients, ...email });
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
        const recipients = await getStudioNotificationEmails(project.studioId);
        if (recipients.length === 0) return;

        const email = buildProjectEmail({
          studioName: context.studio.name,
          projectId: project.projectId,
          studioSlug: context.studio.slug,
          audience: "studio",
          title: "預約有新留言",
          body: `${input.authorLabel} 在 ${project.projectId} 留下訊息：\n「${preview}」`,
        });

        await sendEmail({ to: recipients, ...email });
        return;
      }

      const clientEmail = await getClientNotificationEmail(project);
      if (!clientEmail) return;

      const email = buildProjectEmail({
        studioName: context.studio.name,
        projectId: project.projectId,
        studioSlug: context.studio.slug,
        audience: "client",
        title: "工作室回覆了您的留言",
        body: `${context.studio.name} 在預約 ${project.projectId} 回覆：\n「${preview}」`,
      });

      await sendEmail({ to: clientEmail, ...email });
    })(),
    "new_discussion_message",
    project.projectId
  );
}

function buildQuoteNotificationCopy(
  studioName: string,
  project: Project,
  input: { quoteChanged: boolean; slotsChanged: boolean; isFirstSend: boolean }
) {
  const sessionIndex = project.currentSessionIndex ?? 1;
  const totalSessions = project.sessionDetails?.sessions ?? 1;
  const sessionHint =
    totalSessions > 1
      ? `（第 ${sessionIndex} 次報價，共 ${totalSessions} 次；每次分開計價）`
      : "";

  if (input.isFirstSend) {
    return {
      title: "報價與時段已送出",
      body: `${studioName} 已提供報價與可預約時段${sessionHint}，請登入查看並確認。`,
    };
  }

  if (input.quoteChanged && input.slotsChanged) {
    return {
      title: "報價與時段已更新",
      body: `${studioName} 已更新報價與可預約時段${sessionHint}，請登入查看並確認。`,
    };
  }

  if (input.slotsChanged) {
    return {
      title: "可預約時段已更新",
      body: `${studioName} 已更新可預約時段${sessionHint}，請登入查看並擇一確認。`,
    };
  }

  return {
    title: "報價已更新",
    body: `${studioName} 已更新報價${sessionHint}，請登入查看。`,
  };
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

      const clientEmail = await getClientNotificationEmail(project);
      if (!clientEmail) return;

      const copy = buildQuoteNotificationCopy(
        context.studio.name,
        project,
        input
      );

      const email = buildProjectEmail({
        studioName: context.studio.name,
        projectId: project.projectId,
        studioSlug: context.studio.slug,
        audience: "client",
        title: copy.title,
        body: copy.body,
      });

      await sendEmail({ to: clientEmail, ...email });
    })(),
    event,
    project.projectId
  );
}

export function notifySlotReserved(project: Project, studio: Studio) {
  dispatch(
    (async () => {
      const clientEmail = await getClientNotificationEmail(project);
      const slot = getActiveProjectTimeSlot(project);

      if (!clientEmail || !slot || !project.depositDeadlineAt) {
        return;
      }

      const dict = await getAppDictionary(defaultLocale);
      const slotLabel = formatSessionSlotLabel(
        project,
        slot,
        getCurrentSessionIndex(project),
        dict,
      );
      const deadlineLabel = formatDepositDeadline(
        project.depositDeadlineAt,
        dict.dates,
      );

      const clientEmailContent = buildProjectEmail({
        studioName: studio.name,
        projectId: project.projectId,
        studioSlug: studio.slug,
        audience: "client",
        title: "時段已保留，請完成訂金轉帳",
        body: `您已選定時段：${slotLabel}。\n請於 ${deadlineLabel} 前完成訂金轉帳，逾期將自動取消預約。`,
      });

      await sendEmail({ to: clientEmail, ...clientEmailContent });

      const studioRecipients = await getStudioNotificationEmails(project.studioId);
      if (studioRecipients.length === 0) {
        return;
      }

      const clientUser = await getUserById(project.clientId);
      const clientName = getClientDisplayName(
        project,
        clientUser,
        dict.project,
      );

      const studioEmailContent = buildProjectEmail({
        studioName: studio.name,
        projectId: project.projectId,
        studioSlug: studio.slug,
        audience: "studio",
        title: "客戶已選定時段",
        body: `${clientName} 已選定時段（${slotLabel}），訂金期限至 ${deadlineLabel}。`,
      });

      await sendEmail({ to: studioRecipients, ...studioEmailContent });
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
      const clientEmail = await getClientNotificationEmail(project);
      const studioRecipients = await getStudioNotificationEmails(project.studioId);

      const body =
        `預約 ${project.projectId} 因未於期限內完成訂金轉帳，時段保留已取消。` +
        `請重新選擇可預約時段。`;

      if (clientEmail) {
        const clientEmailContent = buildProjectEmail({
          studioName: studio.name,
          projectId: project.projectId,
          studioSlug: studio.slug,
          audience: "client",
          title: "預約已逾期取消",
          body,
        });

        await sendEmail({ to: clientEmail, ...clientEmailContent });
      }

      if (studioRecipients.length > 0) {
        const studioEmailContent = buildProjectEmail({
          studioName: studio.name,
          projectId: project.projectId,
          studioSlug: studio.slug,
          audience: "studio",
          title: "客戶訂金逾期，預約已取消",
          body: `預約 ${project.projectId} 因客戶未於期限內完成訂金轉帳，時段已釋放。`,
        });

        await sendEmail({ to: studioRecipients, ...studioEmailContent });
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

      const recipients = await getStudioNotificationEmails(project.studioId);
      if (recipients.length === 0) return;

      const dict = await getAppDictionary(defaultLocale);
      const clientUser = await getUserById(project.clientId);
      const clientName = getClientDisplayName(
        project,
        clientUser,
        dict.project,
      );

      const email = buildProjectEmail({
        studioName: context.studio.name,
        projectId: project.projectId,
        studioSlug: context.studio.slug,
        audience: "studio",
        title: "客戶已上傳訂金證明",
        body: `${clientName} 已確認時段並上傳訂金證明（${project.projectId}），請至後台審核。`,
      });

      await sendEmail({ to: recipients, ...email });
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

      const clientEmail = await getClientNotificationEmail(project);
      if (!clientEmail) return;

      const countHint =
        input.newCount > 1 ? `（共 ${input.newCount} 張）` : "";

      const email = buildProjectEmail({
        studioName: context.studio.name,
        projectId: project.projectId,
        studioSlug: context.studio.slug,
        audience: "client",
        title: "工作室已上傳設計稿",
        body: `${context.studio.name} 已為預約 ${project.projectId} 上傳設計稿${countHint}，請登入查看並確認。`,
      });

      await sendEmail({ to: clientEmail, ...email });
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

      const clientEmail = await getClientNotificationEmail(project);
      if (!clientEmail) return;

      const countHint =
        input.newCount > 1 ? `（共 ${input.newCount} 張）` : "";

      const email = buildProjectEmail({
        studioName: context.studio.name,
        projectId: project.projectId,
        studioSlug: context.studio.slug,
        audience: "client",
        title: "工作室已上傳成品照",
        body: `${context.studio.name} 已上傳您的刺青成品照${countHint}（預約 ${project.projectId}），請至預約頁查看。`,
      });

      await sendEmail({ to: clientEmail, ...email });
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

      const clientEmail = await getClientNotificationEmail(project);
      if (!clientEmail) return;

      const email = buildProjectEmail({
        studioName: context.studio.name,
        projectId: project.projectId,
        studioSlug: context.studio.slug,
        audience: "client",
        title: "預約已完成",
        body: `${context.studio.name} 已將預約 ${project.projectId} 標記為完成，請至預約頁查看成品照與術後照護指引。`,
      });

      await sendEmail({ to: clientEmail, ...email });
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

      const clientEmail = await getClientNotificationEmail(project);
      if (!clientEmail) return;

      const sessionIndex = getCurrentSessionIndex(project);
      const hasMoreSessions = hasMoreSessionsToBook(project);
      const body = hasMoreSessions
        ? `${context.studio.name} 已確認第 ${sessionIndex} 次 Session 訂金，預約已成立。請準時抵達；工作室會於施作前提供設計稿供您確認，施作完成後上傳成品照，再安排下一次 Session。`
        : `${context.studio.name} 已確認訂金，您的預約（${project.projectId}）已成立。`;

      const title = hasMoreSessions ? "本次 Session 預約已成立" : "預約已成立";

      const email = buildProjectEmail({
        studioName: context.studio.name,
        projectId: project.projectId,
        studioSlug: context.studio.slug,
        audience: "client",
        title,
        body,
      });

      await sendEmail({ to: clientEmail, ...email });
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

      const clientEmail = await getClientNotificationEmail(project);
      if (!clientEmail) return;

      const sessionIndex = getCurrentSessionIndex(project);
      const totalSessions = getTotalSessions(project);
      const body =
        totalSessions > 1
          ? `${context.studio.name} 已完成第 ${sessionIndex - 1} 次 Session 作品交付。第 ${sessionIndex} 次 Session 的報價與時段準備好後會再通知您。`
          : `${context.studio.name} 已完成作品交付，報價與時段準備好後會再通知您。`;

      const email = buildProjectEmail({
        studioName: context.studio.name,
        projectId: project.projectId,
        studioSlug: context.studio.slug,
        audience: "client",
        title: "可安排下一次 Session",
        body,
      });

      await sendEmail({ to: clientEmail, ...email });
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
        const recipients = await getStudioNotificationEmails(project.studioId);
        if (recipients.length === 0) return;

        const dict = await getAppDictionary(defaultLocale);
        const clientUser = await getUserById(project.clientId);
        const clientName = getClientDisplayName(
          project,
          clientUser,
          dict.project,
        );

        const email = buildProjectEmail({
          studioName: studio.name,
          projectId: project.projectId,
          studioSlug: studio.slug,
          audience: "studio",
          title: "客戶已完成術前文件簽署",
          body: `${clientName} 已線上簽署「${input.documentTitle}」（預約 ${project.projectId}），請至後台查看存檔。`,
        });

        await sendEmail({ to: recipients, ...email });
        return;
      }

      const clientEmail = await getClientNotificationEmail(project);
      if (!clientEmail) return;

      const email = buildProjectEmail({
        studioName: studio.name,
        projectId: project.projectId,
        studioSlug: studio.slug,
        audience: "client",
        title: "術前文件已存檔",
        body: `${studio.name} 已上傳並存檔您的「${input.documentTitle}」（預約 ${project.projectId}），請至預約頁查看。`,
      });

      await sendEmail({ to: clientEmail, ...email });
    })(),
    "pre_session_document_completed",
    project.projectId
  );
}
