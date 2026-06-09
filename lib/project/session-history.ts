import type { AppDictionary } from "@/lib/i18n/app-types";
import { formatMessage } from "@/lib/i18n/format";
import {
  getActiveProjectDepositProof,
  getActiveProjectTimeSlot,
} from "@/lib/project/active-session-state";
import { isAwaitingDepositPayment } from "@/lib/project/deposit-deadline";
import { formatPrice, formatTimeSlot } from "@/lib/project/format";
import {
  getCurrentSessionIndex,
  getCurrentSessionPricing,
  getTotalSessions,
  hasMoreSessionsToBook,
  isMultiSession,
  isSessionDeliveryComplete,
  requiresDepositForCurrentSession,
} from "@/lib/project/session-schedule";
import type { Project } from "@/types/project";
import type { SessionRecord } from "@/types/session-record";
import type { TimeSlot } from "@/types/session-details";

export type SessionHistoryPhase =
  | "completed"
  | "delivery_pending"
  | "deposit_review"
  | "pending_payment"
  | "scheduling"
  | "upcoming";

export interface SessionHistoryItem {
  sessionIndex: number;
  totalSessions: number;
  phase: SessionHistoryPhase;
  timeSlot?: TimeSlot;
  depositProofUrl?: string;
  depositSubmittedAt?: Date;
  confirmedAt?: Date;
  depositLabel?: string;
  depositWaived?: boolean;
  isCurrent: boolean;
  defaultExpanded: boolean;
}

function reviveSlot(slot: TimeSlot): TimeSlot {
  return {
    startTime: new Date(slot.startTime),
    endTime: new Date(slot.endTime),
  };
}

function reviveRecord(record: SessionRecord): SessionRecord {
  return {
    ...record,
    confirmedTimeSlot: reviveSlot(record.confirmedTimeSlot),
    depositSubmittedAt: record.depositSubmittedAt
      ? new Date(record.depositSubmittedAt)
      : undefined,
    confirmedAt: record.confirmedAt ? new Date(record.confirmedAt) : undefined,
    deliveryCompletedAt: record.deliveryCompletedAt
      ? new Date(record.deliveryCompletedAt)
      : undefined,
  };
}

export function getPersistedSessionRecords(project: Project): SessionRecord[] {
  if (project.sessionRecords?.length) {
    return [...project.sessionRecords]
      .map(reviveRecord)
      .sort((a, b) => a.sessionIndex - b.sessionIndex);
  }

  return (project.confirmedTimeSlots ?? []).map((slot, index) => ({
    sessionIndex: index + 1,
    confirmedTimeSlot: reviveSlot(slot),
  }));
}

export function shouldShowSessionHistory(project: Project): boolean {
  return isMultiSession(project) || getPersistedSessionRecords(project).length > 1;
}

function getDepositInfo(
  project: Project,
  common: AppDictionary["common"],
): {
  depositLabel?: string;
  depositWaived: boolean;
} {
  const deposit = getCurrentSessionPricing(project)?.depositRequired;
  if (deposit === undefined) {
    return { depositWaived: false };
  }

  const amount = Number(deposit);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { depositWaived: true };
  }

  return {
    depositLabel: formatPrice(deposit, common),
    depositWaived: false,
  };
}

function getPhaseLabel(
  phase: SessionHistoryPhase,
  dict: AppDictionary["project"],
): string {
  switch (phase) {
    case "completed":
      return dict.sessionHistoryPhaseCompleted;
    case "delivery_pending":
      return dict.sessionHistoryPhaseDeliveryPending;
    case "deposit_review":
      return dict.sessionHistoryPhaseDepositReview;
    case "pending_payment":
      return dict.sessionHistoryPhasePendingPayment;
    case "scheduling":
      return dict.sessionHistoryPhaseScheduling;
    case "upcoming":
      return dict.sessionHistoryPhaseUpcoming;
  }
}

export function getSessionHistoryPhaseLabel(
  phase: SessionHistoryPhase,
  dict: AppDictionary["project"],
): string {
  return getPhaseLabel(phase, dict);
}

export function shouldShowSessionHistoryDepositAmount(
  item: SessionHistoryItem,
): boolean {
  if (!item.depositLabel || item.depositWaived) {
    return false;
  }

  return (
    item.isCurrent &&
    (item.phase === "pending_payment" ||
      item.phase === "deposit_review" ||
      item.phase === "scheduling")
  );
}

export function buildSessionHistory(
  project: Project,
  dict: AppDictionary,
): SessionHistoryItem[] {
  const total = getTotalSessions(project);
  if (total <= 1) {
    return [];
  }

  const { depositLabel, depositWaived } = getDepositInfo(project, dict.common);
  const recordsByIndex = new Map(
    getPersistedSessionRecords(project).map((record) => [
      record.sessionIndex,
      record,
    ]),
  );
  const currentIndex = getCurrentSessionIndex(project);
  const items: SessionHistoryItem[] = [];

  for (let sessionIndex = 1; sessionIndex <= total; sessionIndex += 1) {
    const record = recordsByIndex.get(sessionIndex);
    const isCurrent = sessionIndex === currentIndex;

    if (record && !isCurrent) {
      items.push({
        sessionIndex,
        totalSessions: total,
        phase: "completed",
        timeSlot: record.confirmedTimeSlot,
        depositProofUrl: record.depositProofUrl,
        depositSubmittedAt: record.depositSubmittedAt,
        confirmedAt: record.confirmedAt,
        isCurrent: false,
        defaultExpanded: false,
      });
      continue;
    }

    if (!isCurrent) {
      items.push({
        sessionIndex,
        totalSessions: total,
        phase: "upcoming",
        isCurrent: false,
        defaultExpanded: false,
      });
      continue;
    }

    let phase: SessionHistoryPhase = "scheduling";

    if (project.status === "pending_payment") {
      phase = "pending_payment";
    } else if (project.status === "deposit_submitted") {
      phase = "deposit_review";
    } else if (project.status === "booked") {
      phase =
        hasMoreSessionsToBook(project) &&
        !isSessionDeliveryComplete(project, sessionIndex)
          ? "delivery_pending"
          : "completed";
    } else if (project.status === "completed") {
      phase = "completed";
    } else if (project.status === "quoting") {
      phase = "scheduling";
    }

    const activeSlot = getActiveProjectTimeSlot(project);
    const activeDeposit = getActiveProjectDepositProof(project);
    const timeSlot = activeSlot ?? record?.confirmedTimeSlot;
    const depositProofUrl = activeDeposit.depositProofUrl ?? record?.depositProofUrl;
    const depositSubmittedAt =
      activeDeposit.depositSubmittedAt ?? record?.depositSubmittedAt;

    items.push({
      sessionIndex,
      totalSessions: total,
      phase,
      timeSlot,
      depositProofUrl,
      depositSubmittedAt,
      confirmedAt: record?.confirmedAt,
      depositLabel,
      depositWaived,
      isCurrent: true,
      defaultExpanded:
        phase === "deposit_review" ||
        phase === "pending_payment" ||
        phase === "scheduling" ||
        phase === "delivery_pending",
    });
  }

  return items;
}

export function formatSessionHistoryTime(
  project: Project,
  item: SessionHistoryItem,
  dict: AppDictionary,
): string | null {
  if (!item.timeSlot) {
    return null;
  }

  const total = item.totalSessions;
  const time = formatTimeSlot(item.timeSlot, dict.dates);

  if (total <= 1) {
    return time;
  }

  return formatMessage(dict.project.sessionSlotMulti, {
    index: item.sessionIndex,
    time,
  });
}

export function getSessionHistoryDepositStatus(
  project: Project,
  item: SessionHistoryItem,
  dict: AppDictionary["project"],
  emptyDash: string,
): string {
  if (item.phase === "upcoming") {
    return dict.sessionHistoryNotQuoted;
  }

  if (item.depositWaived) {
    return dict.noDepositRequired;
  }

  if (item.phase === "completed" || item.phase === "delivery_pending") {
    return item.depositProofUrl
      ? dict.sessionHistoryDepositConfirmed
      : dict.sessionHistoryDepositConfirmedNoProof;
  }

  if (item.phase === "deposit_review") {
    return dict.sessionHistoryDepositProofReview;
  }

  if (item.phase === "pending_payment") {
    if (isAwaitingDepositPayment(project)) {
      return dict.sessionHistorySlotAwaitingDeposit;
    }
    return requiresDepositForCurrentSession(project)
      ? dict.sessionHistoryAwaitingDeposit
      : dict.sessionHistoryAwaitingSlotConfirm;
  }

  if (item.phase === "scheduling") {
    return dict.sessionHistoryAwaitingStudioSlots;
  }

  return emptyDash;
}
