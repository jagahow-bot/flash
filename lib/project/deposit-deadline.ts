import { isSameTimeSlot } from "@/lib/project/active-session-state";
import type { Project } from "@/types/project";
import type { TimeSlot } from "@/types/session-details";
import type { Studio } from "@/types/studio";

export const DEFAULT_DEPOSIT_DEADLINE_DAYS = 3;

export function getDepositDeadlineDays(studio: Studio): number {
  const days = studio.depositDeadlineDays;
  if (days === undefined || days < 1) {
    return DEFAULT_DEPOSIT_DEADLINE_DAYS;
  }
  return Math.min(days, 30);
}

export function computeDepositDeadlineAt(
  from: Date,
  deadlineDays: number
): Date {
  const deadline = new Date(from);
  deadline.setDate(deadline.getDate() + deadlineDays);
  return deadline;
}

export function isAwaitingDepositPayment(project: Project): boolean {
  return (
    project.status === "pending_payment" &&
    !!project.confirmedTimeSlot &&
    !project.depositProofUrl
  );
}

export function shouldExpireDepositDeadline(project: Project): boolean {
  return (
    isAwaitingDepositPayment(project) &&
    !!project.depositDeadlineAt &&
    project.depositDeadlineAt < new Date()
  );
}

function mergeProposedSlots(
  existing: TimeSlot[],
  restored: TimeSlot
): TimeSlot[] {
  if (existing.some((slot) => isSameTimeSlot(slot, restored))) {
    return existing;
  }
  return [...existing, restored];
}

export function buildExpiredDepositProject(project: Project): Project {
  const expiredSlot = project.confirmedTimeSlot;
  const proposedTimeSlots = expiredSlot
    ? mergeProposedSlots(project.proposedTimeSlots ?? [], expiredSlot)
    : project.proposedTimeSlots ?? [];

  return {
    ...project,
    confirmedTimeSlot: undefined,
    slotSelectedAt: undefined,
    depositDeadlineAt: undefined,
    proposedTimeSlots,
  };
}
