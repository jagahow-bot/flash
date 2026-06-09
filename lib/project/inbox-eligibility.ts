import { isAwaitingDepositPayment } from "@/lib/project/deposit-deadline";
import { hasPendingInPersonDocuments } from "@/lib/pre-session-documents/records";
import type { AppDictionary } from "@/lib/i18n/app-types";
import {
  getProjectStatusLabel,
  INBOX_ACTION_STATUSES,
} from "@/lib/project/status";
import {
  isAwaitingSessionDelivery,
  isAwaitingTattooSession,
  needsFreshSessionPricing,
} from "@/lib/project/session-schedule";
import type { Project, ProjectStatus } from "@/types/project";
import type { Studio } from "@/types/studio";

export { INBOX_ACTION_STATUSES };

export type InboxSortMode = "priority" | "bookingId";

export type InboxStatusFilter =
  | "all"
  | ProjectStatus
  | "awaitingAssets"
  | "awaitingSession"
  | "awaitingSignature"
  | "awaitingDeposit"
  | "awaitingQuote";

export interface InboxEligibilityOptions {
  studio?: Studio;
  unreadDiscussionCount?: number;
}

const TERMINAL_INBOX_STATUSES = new Set<ProjectStatus>([
  "completed",
  "cancelled",
]);

/**
 * Studio task inbox: all active bookings until every session is finished.
 * Completed and cancelled projects are removed from the inbox.
 */
export function shouldShowInTaskInbox(
  project: Project,
  _options: InboxEligibilityOptions = {}
): boolean {
  return !TERMINAL_INBOX_STATUSES.has(project.status);
}

export function projectNeedsStudioInboxAction(
  project: Project,
  _studio?: Studio
): boolean {
  return shouldShowInTaskInbox(project);
}

/** Lower value = higher priority in the task inbox. */
export function getInboxSortPriority(
  project: Project,
  options: InboxEligibilityOptions = {}
): number {
  const unread = options.unreadDiscussionCount ?? 0;
  const studio = options.studio;

  if (project.status === "deposit_submitted") return 0;
  if (project.status === "pending_brief") return 10;
  if (project.status === "booked" && isAwaitingTattooSession(project)) {
    return 18;
  }
  if (project.status === "booked" && isAwaitingSessionDelivery(project)) {
    return 20;
  }
  if (
    project.status === "booked" &&
    studio &&
    hasPendingInPersonDocuments(project, studio)
  ) {
    return 25;
  }
  if (project.status === "booked") return 28;
  if (project.status === "quoting") return 30;
  if (project.status === "pending_payment") return 40;
  if (unread > 0) return 50;
  return 99;
}

export function compareInboxProjectsByBookingId(a: Project, b: Project): number {
  return b.projectId.localeCompare(a.projectId);
}

export function compareInboxProjects(
  a: Project,
  b: Project,
  options: {
    studio?: Studio;
    unreadDiscussionCounts: Record<string, number>;
  }
): number {
  const unreadA = options.unreadDiscussionCounts[a.projectId] ?? 0;
  const unreadB = options.unreadDiscussionCounts[b.projectId] ?? 0;

  const priorityA = getInboxSortPriority(a, {
    studio: options.studio,
    unreadDiscussionCount: unreadA,
  });
  const priorityB = getInboxSortPriority(b, {
    studio: options.studio,
    unreadDiscussionCount: unreadB,
  });

  if (priorityA !== priorityB) {
    return priorityA - priorityB;
  }

  if (unreadA !== unreadB) {
    return unreadB - unreadA;
  }

  return compareInboxProjectsByBookingId(a, b);
}

export function getInboxStatusStyleKey(
  project: Project,
  studio?: Studio,
): string {
  if (project.status === "booked") {
    if (isAwaitingTattooSession(project)) {
      return "awaitingSession";
    }
    if (isAwaitingSessionDelivery(project)) {
      return "awaitingAssets";
    }
    if (studio && hasPendingInPersonDocuments(project, studio)) {
      return "awaitingSignature";
    }
  }

  if (project.status === "pending_payment" && isAwaitingDepositPayment(project)) {
    return "awaitingDeposit";
  }

  if (project.status === "quoting" && needsFreshSessionPricing(project)) {
    return "awaitingQuote";
  }

  return project.status;
}

export function getInboxStatusLabel(
  project: Project,
  dict: AppDictionary,
  studio?: Studio,
): string {
  if (project.status === "booked") {
    if (isAwaitingTattooSession(project)) {
      return dict.status.inbox.awaitingSession;
    }
    if (isAwaitingSessionDelivery(project)) {
      return dict.status.inbox.awaitingAssets;
    }
    if (studio && hasPendingInPersonDocuments(project, studio)) {
      return dict.status.inbox.awaitingSignature;
    }
  }

  if (project.status === "pending_payment" && isAwaitingDepositPayment(project)) {
    return dict.status.inbox.awaitingDeposit;
  }

  if (project.status === "quoting" && needsFreshSessionPricing(project)) {
    return dict.status.inbox.awaitingQuote;
  }

  return getProjectStatusLabel(project.status, dict);
}

export function matchesInboxStatusFilter(
  project: Project,
  filter: InboxStatusFilter,
  studio?: Studio,
): boolean {
  if (filter === "all") {
    return true;
  }

  if (filter === project.status) {
    return true;
  }

  return filter === getInboxStatusStyleKey(project, studio);
}
