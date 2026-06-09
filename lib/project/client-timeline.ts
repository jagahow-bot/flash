import type { AppDictionary } from "@/lib/i18n/app-types";
import { formatMessage } from "@/lib/i18n/format";
import { getClientTimelineLabel } from "@/lib/project/status";
import {
  getCurrentSessionIndex,
  getSessionRecord,
  getTotalSessions,
  isMultiSession,
  isSessionDeliveryComplete,
} from "@/lib/project/session-schedule";
import type { Project, ProjectStatus } from "@/types/project";

export type TimelineStepState = "done" | "current" | "pending";

export interface TimelineStep {
  key: string;
  label: string;
  state: TimelineStepState;
}

export interface SessionTimelineGroup {
  sessionIndex: number;
  label: string;
  steps: TimelineStep[];
}

const SINGLE_SESSION_STEPS: ProjectStatus[] = [
  "pending_brief",
  "quoting",
  "pending_payment",
  "deposit_submitted",
  "booked",
  "completed",
];

const SESSION_1_STEP_COUNT = 5;
const SESSION_N_STEP_COUNT = 4;

function singleSessionStepIndex(status: ProjectStatus): number {
  return SINGLE_SESSION_STEPS.indexOf(status);
}

function buildStepsFromCurrentIndex(
  defs: readonly { key: string; label: string }[],
  currentStepIndex: number | null
): TimelineStep[] {
  if (currentStepIndex === null) {
    return defs.map((def) => ({ ...def, state: "done" as const }));
  }

  if (currentStepIndex < 0) {
    return defs.map((def) => ({ ...def, state: "pending" as const }));
  }

  return defs.map((def, index) => ({
    ...def,
    state:
      index < currentStepIndex
        ? "done"
        : index === currentStepIndex
          ? "current"
          : "pending",
  }));
}

function getCurrentSessionStepIndex(
  project: Project,
  sessionIndex: number
): number | null {
  const currentIndex = getCurrentSessionIndex(project);
  const totalSessions = getTotalSessions(project);
  const record = getSessionRecord(project, sessionIndex);
  const stepCount =
    sessionIndex === 1 ? SESSION_1_STEP_COUNT : SESSION_N_STEP_COUNT;

  if (sessionIndex < currentIndex) {
    return null;
  }

  if (sessionIndex > currentIndex) {
    return -1;
  }

  if (isSessionDeliveryComplete(project, sessionIndex)) {
    return null;
  }

  if (
    project.status === "completed" &&
    sessionIndex === totalSessions
  ) {
    return null;
  }

  const status = project.status;

  if (sessionIndex === 1) {
    switch (status) {
      case "pending_brief":
        return 0;
      case "quoting":
        return 1;
      case "pending_payment":
      case "deposit_submitted":
        return 2;
      case "booked":
        return record?.confirmedAt ? stepCount - 1 : 3;
      case "completed":
        return null;
      default:
        return 0;
    }
  }

  switch (status) {
    case "quoting":
      return 0;
    case "pending_payment":
    case "deposit_submitted":
      return 1;
    case "booked":
      return stepCount - 1;
    case "completed":
      return null;
    default:
      return 0;
  }
}

export function buildMultiSessionTimeline(
  project: Project,
  dict: AppDictionary,
): { sessions: SessionTimelineGroup[]; globalComplete: TimelineStep } {
  const total = getTotalSessions(project);
  const sessions: SessionTimelineGroup[] = [];

  const session1Defs = [
    { key: "intake", label: dict.status.clientTimeline.pending_brief },
    { key: "quoting", label: dict.status.clientTimeline.quoting },
    { key: "payment", label: dict.status.clientTimeline.pending_payment },
    { key: "booked", label: dict.status.clientTimeline.booked },
    { key: "delivery", label: dict.project.allComplete },
  ] as const;

  const sessionNDefs = [
    { key: "quoting", label: dict.status.clientTimeline.quoting },
    { key: "payment", label: dict.status.clientTimeline.pending_payment },
    { key: "booked", label: dict.status.clientTimeline.booked },
    { key: "delivery", label: dict.project.allComplete },
  ] as const;

  for (let sessionIndex = 1; sessionIndex <= total; sessionIndex += 1) {
    const defs = sessionIndex === 1 ? session1Defs : sessionNDefs;
    const currentStepIndex = getCurrentSessionStepIndex(project, sessionIndex);

    sessions.push({
      sessionIndex,
      label: formatMessage(dict.project.arrangingSession, { index: sessionIndex }),
      steps: buildStepsFromCurrentIndex(defs, currentStepIndex),
    });
  }

  const globalComplete: TimelineStep = {
    key: "all_complete",
    label: dict.project.allComplete,
    state: project.status === "completed" ? "done" : "pending",
  };

  return { sessions, globalComplete };
}

export function buildSingleSessionTimeline(
  project: Project,
  dict: AppDictionary,
): TimelineStep[] {
  const currentIndex = singleSessionStepIndex(project.status);

  return SINGLE_SESSION_STEPS.map((status, index) => ({
    key: status,
    label: getClientTimelineLabel(status, dict),
    state:
      index < currentIndex
        ? "done"
        : index === currentIndex
          ? "current"
          : "pending",
  }));
}

export function shouldUseMultiSessionTimeline(project: Project): boolean {
  return isMultiSession(project);
}
