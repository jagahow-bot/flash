import { getPersistedSessionRecords } from "@/lib/project/session-history";
import { getCurrentSessionIndex } from "@/lib/project/session-schedule";
import type { Project } from "@/types/project";
import type { TimeSlot } from "@/types/session-details";

function reviveDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function reviveSlot(slot: TimeSlot): TimeSlot {
  return {
    startTime: reviveDate(slot.startTime),
    endTime: reviveDate(slot.endTime),
  };
}

export function isSameTimeSlot(a: TimeSlot, b: TimeSlot): boolean {
  const left = reviveSlot(a);
  const right = reviveSlot(b);
  return (
    left.startTime.getTime() === right.startTime.getTime() &&
    left.endTime.getTime() === right.endTime.getTime()
  );
}

export function isTimeSlotRecordedForOtherSession(
  project: Project,
  slot: TimeSlot,
  sessionIndex: number
): boolean {
  return getPersistedSessionRecords(project).some(
    (record) =>
      record.sessionIndex !== sessionIndex &&
      isSameTimeSlot(record.confirmedTimeSlot, slot)
  );
}

export function isDepositProofRecordedForOtherSession(
  project: Project,
  depositProofUrl: string,
  sessionIndex: number
): boolean {
  return getPersistedSessionRecords(project).some(
    (record) =>
      record.sessionIndex !== sessionIndex &&
      record.depositProofUrl === depositProofUrl
  );
}

/**
 * Project-level confirmedTimeSlot only applies to the in-flight current session.
 * Stale values left on the document after advancing sessions are ignored.
 */
export function getActiveProjectTimeSlot(project: Project): TimeSlot | undefined {
  const sessionIndex = getCurrentSessionIndex(project);

  if (project.confirmedTimeSlot) {
    const slot = reviveSlot(project.confirmedTimeSlot);

    if (isTimeSlotRecordedForOtherSession(project, slot, sessionIndex)) {
      return undefined;
    }

    if (project.status === "quoting" || project.status === "pending_brief") {
      return undefined;
    }

    return slot;
  }

  if (project.status === "booked" || project.status === "completed") {
    const record = getPersistedSessionRecords(project).find(
      (entry) => entry.sessionIndex === sessionIndex
    );

    if (record) {
      return reviveSlot(record.confirmedTimeSlot);
    }
  }

  return undefined;
}

export function getActiveProjectDepositProof(project: Project): {
  depositProofUrl?: string;
  depositSubmittedAt?: Date;
} {
  if (!project.depositProofUrl) {
    return {};
  }

  const sessionIndex = getCurrentSessionIndex(project);

  if (
    isDepositProofRecordedForOtherSession(
      project,
      project.depositProofUrl,
      sessionIndex
    )
  ) {
    return {};
  }

  if (project.status !== "deposit_submitted") {
    return {};
  }

  return {
    depositProofUrl: project.depositProofUrl,
    depositSubmittedAt: project.depositSubmittedAt
      ? new Date(project.depositSubmittedAt)
      : undefined,
  };
}
