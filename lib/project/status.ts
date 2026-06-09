import type { AppDictionary } from "@/lib/i18n/app-types";
import type { ProjectStatus } from "@/types/project";

/** Statuses that always appear in the studio task inbox. */
export const INBOX_ACTION_STATUSES: ProjectStatus[] = [
  "pending_brief",
  "quoting",
  "pending_payment",
  "deposit_submitted",
];

/** @deprecated Use INBOX_ACTION_STATUSES or shouldShowInTaskInbox from inbox-eligibility */
export const INBOX_STATUSES = INBOX_ACTION_STATUSES;

export function getStudioStatusLabel(
  status: ProjectStatus,
  dict: AppDictionary,
): string {
  return dict.status.studio[status];
}

export function getClientTimelineLabel(
  status: ProjectStatus,
  dict: AppDictionary,
): string {
  return dict.status.clientTimeline[status];
}

export function getProjectStatusLabel(
  status: ProjectStatus,
  dict: AppDictionary,
): string {
  return getStudioStatusLabel(status, dict);
}
