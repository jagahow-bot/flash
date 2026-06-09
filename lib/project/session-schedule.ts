import type { AppDictionary } from "@/lib/i18n/app-types";
import { formatMessage } from "@/lib/i18n/format";
import { formatPrice, formatTimeSlot } from "@/lib/project/format";
import { getPersistedSessionRecords } from "@/lib/project/session-history";
import type { Project } from "@/types/project";
import type { SessionRecord } from "@/types/session-record";
import type { SessionDetails, TimeSlot } from "@/types/session-details";

export function getTotalSessions(project: Project): number {
  return Math.max(1, project.sessionDetails?.sessions ?? 1);
}

export function getCurrentSessionIndex(project: Project): number {
  return project.currentSessionIndex ?? 1;
}

export function isMultiSession(project: Project): boolean {
  return getTotalSessions(project) > 1;
}

export interface SessionLabelOptions {
  sessionCountOverride?: number;
  currentSessionIndexOverride?: number;
}

function resolveSessionCount(
  project: Project,
  options?: SessionLabelOptions
): number {
  if (options?.sessionCountOverride !== undefined) {
    return Math.max(1, options.sessionCountOverride);
  }
  return getTotalSessions(project);
}

function resolveCurrentSessionIndex(
  project: Project,
  options?: SessionLabelOptions
): number {
  if (options?.currentSessionIndexOverride !== undefined) {
    return Math.max(1, options.currentSessionIndexOverride);
  }
  return getCurrentSessionIndex(project);
}

function isEffectivelyMultiSession(
  project: Project,
  options?: SessionLabelOptions
): boolean {
  return resolveSessionCount(project, options) > 1;
}

export function hasReusableSketches(project: Project): boolean {
  return (
    isMultiSession(project) &&
    getBookedSessionCount(project) > 0 &&
    project.sketches.length > 0
  );
}

export function getConfirmedSessionSlots(project: Project): TimeSlot[] {
  const records = getPersistedSessionRecords(project);
  if (records.length > 0) {
    return records.map((record) => record.confirmedTimeSlot);
  }

  if (project.confirmedTimeSlots?.length) {
    return project.confirmedTimeSlots;
  }

  if (project.confirmedTimeSlot) {
    return [project.confirmedTimeSlot];
  }

  return [];
}

export function getBookedSessionCount(project: Project): number {
  return getConfirmedSessionSlots(project).length;
}

export function hasMoreSessionsToBook(project: Project): boolean {
  return getBookedSessionCount(project) < getTotalSessions(project);
}

export function getSessionRecord(
  project: Project,
  sessionIndex: number
): SessionRecord | undefined {
  return getPersistedSessionRecords(project).find(
    (record) => record.sessionIndex === sessionIndex
  );
}

export function isSessionDeliveryComplete(
  project: Project,
  sessionIndex: number
): boolean {
  return !!getSessionRecord(project, sessionIndex)?.deliveryCompletedAt;
}

/** 已預約但尚未完成本次 Session 的作品交付 */
export function isAwaitingSessionDelivery(project: Project): boolean {
  if (project.status !== "booked") {
    return false;
  }

  const currentIndex = getCurrentSessionIndex(project);
  return !isSessionDeliveryComplete(project, currentIndex);
}

/** 已預約、已有設計稿，等待施作或標記完成 */
export function isAwaitingTattooSession(project: Project): boolean {
  if (project.status !== "booked" || !isAwaitingSessionDelivery(project)) {
    return false;
  }

  return project.sketches.length > 0;
}

export function needsFreshSessionPricing(project: Project): boolean {
  if (!isMultiSession(project)) {
    return false;
  }

  if (project.status !== "quoting") {
    return false;
  }

  return getBookedSessionCount(project) > 0 && hasMoreSessionsToBook(project);
}

export function clearCurrentSessionPricing(
  sessionDetails: SessionDetails | undefined
): SessionDetails | undefined {
  if (!sessionDetails) {
    return sessionDetails;
  }

  const cleared: SessionDetails = {
    ...sessionDetails,
    totalPrice: "",
    depositRequired: "",
  };
  delete cleared.pricedSessionIndex;
  return cleared;
}

function shouldTreatPricingAsStale(project: Project): boolean {
  return needsFreshSessionPricing(project);
}

export function getCurrentSessionPricing(
  project: Project
): Pick<SessionDetails, "totalPrice" | "depositRequired"> | null {
  if (!project.sessionDetails) {
    return null;
  }

  const { totalPrice, depositRequired, pricedSessionIndex } =
    project.sessionDetails;
  const currentIndex = getCurrentSessionIndex(project);

  const appliesToCurrent =
    pricedSessionIndex === undefined
      ? !shouldTreatPricingAsStale(project)
      : pricedSessionIndex === currentIndex;

  if (!appliesToCurrent) {
    return { totalPrice: "", depositRequired: "" };
  }

  return { totalPrice, depositRequired };
}

export function hasCurrentSessionPricing(project: Project): boolean {
  const pricing = getCurrentSessionPricing(project);
  if (!pricing) {
    return false;
  }

  const hasPrice = pricing.totalPrice !== "" && pricing.totalPrice !== undefined;
  const hasDeposit =
    pricing.depositRequired !== "" && pricing.depositRequired !== undefined;

  return hasPrice || hasDeposit;
}

export function getSessionBookingTitle(
  project: Project,
  dict: AppDictionary["project"],
): string {
  const index = getCurrentSessionIndex(project);
  const total = getTotalSessions(project);

  if (total <= 1) {
    return dict.sessionBookingTitle;
  }

  return formatMessage(dict.sessionBookingTitleMulti, { index });
}

export function getSessionProgressLabel(
  project: Project,
  dict: AppDictionary["project"],
): string | null {
  const total = getTotalSessions(project);
  if (total <= 1) {
    return null;
  }

  const booked = getBookedSessionCount(project);
  return formatMessage(dict.sessionProgress, { booked, total });
}

export function formatSessionSlotLabel(
  project: Project,
  slot: TimeSlot,
  sessionIndex: number,
  dict: AppDictionary,
): string {
  const total = getTotalSessions(project);
  const time = formatTimeSlot(slot, dict.dates);

  if (total <= 1) {
    return time;
  }

  return formatMessage(dict.project.sessionSlotMulti, {
    index: sessionIndex,
    time,
  });
}

export function requiresDepositForCurrentSession(project: Project): boolean {
  const deposit = Number(
    getCurrentSessionPricing(project)?.depositRequired ?? 0
  );
  return deposit > 0;
}

export function getCurrentSessionDepositLabel(
  project: Project,
  dict: AppDictionary,
): string {
  const amount = getCurrentSessionPricing(project)?.depositRequired;
  if (amount === undefined) {
    return dict.project.depositLabel;
  }

  const formatted = formatPrice(amount, dict.common);

  if (!isMultiSession(project)) {
    return formatted;
  }

  return formatMessage(dict.project.depositWithSession, {
    amount: formatted,
    index: getCurrentSessionIndex(project),
  });
}

export function getSessionPriceFieldLabel(
  project: Project,
  dict: AppDictionary["project"],
  options?: SessionLabelOptions,
): string {
  if (!isEffectivelyMultiSession(project, options)) {
    return dict.totalPriceField;
  }

  return formatMessage(dict.sessionPriceField, {
    index: resolveCurrentSessionIndex(project, options),
  });
}

export function getSessionDepositFieldLabel(
  project: Project,
  dict: AppDictionary["project"],
  options?: SessionLabelOptions,
): string {
  if (!isEffectivelyMultiSession(project, options)) {
    return dict.depositField;
  }

  return dict.sessionDepositField;
}

export function getSessionPriceDisplayLabel(
  project: Project,
  dict: AppDictionary["project"],
): string {
  if (!isMultiSession(project)) {
    return dict.totalPriceLabel;
  }

  return formatMessage(dict.sessionPriceLabel, {
    index: getCurrentSessionIndex(project),
  });
}

export function getSessionQuoteHelperText(
  project: Project,
  dict: AppDictionary["project"],
  options?: SessionLabelOptions,
): string | null {
  if (!isEffectivelyMultiSession(project, options)) {
    return null;
  }

  const index = resolveCurrentSessionIndex(project, options);
  return formatMessage(dict.sessionQuoteHelper, { index });
}

export function getSessionPriceOverviewHint(
  project: Project,
  dict: AppDictionary,
  emptyDash: string,
): string | null {
  if (!project.sessionDetails) {
    return null;
  }

  const pricing = getCurrentSessionPricing(project);
  if (!pricing) {
    return null;
  }

  const { totalPrice, depositRequired } = pricing;
  const hasPrice = totalPrice !== "" && totalPrice !== undefined;
  const hasDeposit = depositRequired !== "" && depositRequired !== undefined;

  if (!hasPrice && !hasDeposit) {
    return null;
  }

  const price = hasPrice ? formatPrice(totalPrice, dict.common) : emptyDash;
  const deposit = hasDeposit
    ? formatPrice(depositRequired, dict.common)
    : emptyDash;

  if (!isMultiSession(project)) {
    return formatMessage(dict.project.priceOverviewSingle, { price, deposit });
  }

  const index = getCurrentSessionIndex(project);
  return formatMessage(dict.project.priceOverviewMulti, {
    index,
    price,
    deposit,
  });
}

export function getSessionInboxPriceLabel(
  project: Project,
  dict: AppDictionary,
): string | null {
  if (!project.sessionDetails) {
    return null;
  }

  const rawPrice = getCurrentSessionPricing(project)?.totalPrice;
  if (rawPrice === "" || rawPrice === undefined) {
    return null;
  }

  const price = formatPrice(rawPrice, dict.common);

  if (!isMultiSession(project)) {
    return price;
  }

  return formatMessage(dict.project.inboxPriceMulti, {
    index: getCurrentSessionIndex(project),
    price,
  });
}
