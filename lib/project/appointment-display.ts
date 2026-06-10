import type { AppDictionary } from "@/lib/i18n/app-types";
import { formatMessage } from "@/lib/i18n/format";
import { getActiveProjectTimeSlot } from "@/lib/project/active-session-state";
import { isAwaitingDepositPayment } from "@/lib/project/deposit-deadline";
import { formatDepositDeadline } from "@/lib/project/format";
import { formatTimeSlot } from "@/lib/project/format";
import { getProjectStatusLabel } from "@/lib/project/status";
import {
  formatSessionSlotLabel,
  getBookedSessionCount,
  getCurrentSessionIndex,
  getSessionProgressLabel,
  hasMoreSessionsToBook,
  isAwaitingSessionDelivery,
  isMultiSession,
} from "@/lib/project/session-schedule";
import type { Project } from "@/types/project";

export function getAppointmentDisplay(
  project: Project,
  dict: AppDictionary,
): {
  primary: string;
  secondary?: string;
  isConfirmed: boolean;
} {
  const sessionProgress = getSessionProgressLabel(project, dict.project);

  const activeSlot = getActiveProjectTimeSlot(project);

  if (activeSlot) {
    const slotLabel = isMultiSession(project)
      ? formatSessionSlotLabel(
          project,
          activeSlot,
          getCurrentSessionIndex(project),
          dict,
        )
      : formatTimeSlot(activeSlot, dict.dates);

    const awaitingDeposit = isAwaitingDepositPayment(project);

    return {
      primary: slotLabel,
      secondary:
        awaitingDeposit
          ? project.depositDeadlineAt
            ? `${dict.status.appointment.slotReservedAwaitingDeposit} · ${formatDepositDeadline(project.depositDeadlineAt, dict.dates)}`
            : dict.status.appointment.slotReservedAwaitingDeposit
          : project.status === "deposit_submitted"
            ? sessionProgress
              ? `${sessionProgress} · ${dict.status.appointment.depositUnderReview}`
              : dict.status.appointment.depositUnderReview
            : project.status === "booked"
              ? isAwaitingSessionDelivery(project)
                ? `${sessionProgress ?? dict.status.studio.booked} · ${dict.status.inbox.awaitingAssets}`
                : sessionProgress ?? dict.status.studio.booked
              : project.status === "completed"
                ? sessionProgress ?? dict.status.studio.completed
                : sessionProgress ?? undefined,
      isConfirmed: project.status === "booked" || project.status === "completed",
    };
  }

  if (
    getBookedSessionCount(project) > 0 &&
    hasMoreSessionsToBook(project) &&
    project.status === "quoting"
  ) {
    return {
      primary: formatMessage(dict.project.arrangingSession, {
        index: getCurrentSessionIndex(project),
      }),
      secondary: sessionProgress ?? undefined,
      isConfirmed: false,
    };
  }

  if (
    project.status === "pending_payment" &&
    project.proposedTimeSlots &&
    project.proposedTimeSlots.length > 0
  ) {
    return {
      primary: isMultiSession(project)
        ? formatMessage(dict.project.confirmSession, {
            index: getCurrentSessionIndex(project),
          })
        : dict.project.pickSlot,
      secondary: dict.project.sessionHistoryAwaitingSlotConfirm,
      isConfirmed: false,
    };
  }

  if (project.status === "quoting" || project.status === "pending_brief") {
    return {
      primary: isMultiSession(project)
        ? formatMessage(dict.project.arrangingSession, {
            index: getCurrentSessionIndex(project),
          })
        : dict.status.appointment.notScheduled,
      secondary: sessionProgress ?? dict.status.appointment.quotePendingSlots,
      isConfirmed: false,
    };
  }

  return {
    primary: dict.status.appointment.notScheduled,
    secondary: getProjectStatusLabel(project.status, dict),
    isConfirmed: false,
  };
}
