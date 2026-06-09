import { getActiveProjectTimeSlot } from "@/lib/project/active-session-state";
import { getConfirmedSessionSlots } from "@/lib/project/session-schedule";
import type { Project } from "@/types/project";
import type { TimeSlot } from "@/types/session-details";

export type ScheduleCalendarKind = "held" | "active" | "completed";

export interface ScheduleCalendarEntry {
  project: Project;
  slot: TimeSlot;
  kind: ScheduleCalendarKind;
}

function reviveSlot(slot: TimeSlot): TimeSlot {
  return {
    startTime: new Date(slot.startTime),
    endTime: new Date(slot.endTime),
  };
}

function entriesForSlots(
  project: Project,
  slots: TimeSlot[],
  kind: ScheduleCalendarKind
): ScheduleCalendarEntry[] {
  return slots.map((slot) => ({
    project,
    slot: reviveSlot(slot),
    kind,
  }));
}

export function getScheduleCalendarEntries(
  projects: Project[]
): ScheduleCalendarEntry[] {
  const entries: ScheduleCalendarEntry[] = [];

  for (const project of projects) {
    if (project.status === "completed") {
      entries.push(
        ...entriesForSlots(
          project,
          getConfirmedSessionSlots(project),
          "completed"
        )
      );
      continue;
    }

    if (project.status === "booked" || project.status === "deposit_submitted") {
      entries.push(
        ...entriesForSlots(
          project,
          getConfirmedSessionSlots(project),
          "active"
        )
      );
      continue;
    }

    if (project.status === "pending_payment") {
      const heldSlot = getActiveProjectTimeSlot(project);
      if (heldSlot) {
        entries.push({
          project,
          slot: reviveSlot(heldSlot),
          kind: "held",
        });
      }
    }
  }

  return entries.sort(
    (a, b) => a.slot.startTime.getTime() - b.slot.startTime.getTime()
  );
}
