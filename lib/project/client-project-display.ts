import { hasClientPendingPreSessionDocuments } from "@/lib/pre-session-documents/records";
import type { AppDictionary } from "@/lib/i18n/app-types";
import { getAppointmentDisplay } from "@/lib/project/appointment-display";
import { getInboxProjectSize, truncateInboxText } from "@/lib/project/inbox-display";
import { getInboxStatusStyleKey } from "@/lib/project/inbox-eligibility";
import { isAwaitingDepositPayment } from "@/lib/project/deposit-deadline";
import { getClientTimelineLabel } from "@/lib/project/status";
import {
  isAwaitingSessionDelivery,
  isAwaitingTattooSession,
} from "@/lib/project/session-schedule";
import type { Project } from "@/types/project";
import type { Studio } from "@/types/studio";

const DESCRIPTION_MAX_LENGTH = 60;

export function getClientProjectSize(project: Project): string {
  return getInboxProjectSize(project);
}

export function getClientProjectDescription(project: Project): string | null {
  const description = project.intakeForm.description?.trim();
  if (!description) return null;
  return truncateInboxText(description, DESCRIPTION_MAX_LENGTH);
}

export function getClientProjectStatusStyleKey(
  project: Project,
  studio?: Studio,
): string {
  if (
    project.status === "booked" &&
    studio &&
    hasClientPendingPreSessionDocuments(project, studio)
  ) {
    return "awaitingSignature";
  }

  return getInboxStatusStyleKey(project, studio);
}

export function getClientProjectSubStatusLabel(
  project: Project,
  dict: AppDictionary,
  studio?: Studio,
): string | undefined {
  const appointment = getAppointmentDisplay(project, dict);
  const { appointment: appointmentDict, inbox } = dict.status;

  if (project.status === "booked") {
    if (studio && hasClientPendingPreSessionDocuments(project, studio)) {
      return inbox.awaitingSignature;
    }
    if (isAwaitingTattooSession(project)) {
      return inbox.awaitingSession;
    }
    if (isAwaitingSessionDelivery(project)) {
      return inbox.awaitingAssets;
    }
  }

  if (project.status === "pending_payment" && isAwaitingDepositPayment(project)) {
    return appointmentDict.slotReservedAwaitingDeposit;
  }

  if (project.status === "deposit_submitted") {
    return appointmentDict.depositUnderReview;
  }

  if (
    project.status === "pending_payment" &&
    project.proposedTimeSlots &&
    project.proposedTimeSlots.length > 0
  ) {
    return appointmentDict.awaitingClientSlot;
  }

  if (project.status === "quoting") {
    return appointment.secondary ?? appointmentDict.quotePendingSlots;
  }

  if (project.status === "pending_brief") {
    return appointment.secondary ?? undefined;
  }

  if (appointment.secondary?.trim()) {
    return appointment.secondary;
  }

  return undefined;
}

export function getClientProjectStatusDisplay(
  project: Project,
  dict: AppDictionary,
  studio?: Studio,
): {
  primary: string;
  secondary?: string;
  styleKey: string;
} {
  const primary = getClientTimelineLabel(project.status, dict);
  const secondary = getClientProjectSubStatusLabel(project, dict, studio);
  const styleKey = getClientProjectStatusStyleKey(project, studio);

  return { primary, secondary, styleKey };
}
