import { isAwaitingDepositPayment } from "@/lib/project/deposit-deadline";
import {
  getPersistedSessionRecords,
  shouldShowSessionHistory,
} from "@/lib/project/session-history";
import {
  getBookedSessionCount,
  getCurrentSessionIndex,
} from "@/lib/project/session-schedule";
import {
  allRequiredPreSessionDocumentsComplete,
  hasPendingInPersonDocuments,
  hasPreSessionDocumentsToShow,
} from "@/lib/pre-session-documents/records";
import type { Project } from "@/types/project";
import type { Studio } from "@/types/studio";

export type StudioSection =
  | "deposit_awaiting"
  | "deposit_review"
  | "quote_form"
  | "assets"
  | "brief"
  | "intake"
  | "session_history"
  | "portal_link"
  | "pre_session_documents";

export type StudioLayoutZone = "action" | "collaboration" | "reference";

export const STUDIO_ZONE_MARKERS: Record<StudioLayoutZone, string> = {
  action: "🔴",
  collaboration: "🟡",
  reference: "⚪",
};

export interface StudioLayoutZoneGroup {
  zone: StudioLayoutZone;
  sections: StudioSection[];
}

export function shouldShowAssetsSection(project: Project): boolean {
  return (
    project.status === "booked" ||
    project.status === "completed" ||
    getBookedSessionCount(project) > 0
  );
}

function isBetweenSessions(project: Project): boolean {
  if (project.status !== "quoting" && project.status !== "booked") {
    return false;
  }

  return (
    getCurrentSessionIndex(project) > 1 ||
    getPersistedSessionRecords(project).length > 0
  );
}

function referenceSections(
  project: Project,
  sections: StudioSection[]
): StudioSection[] {
  if (!isBetweenSessions(project) || !sections.includes("session_history")) {
    return sections;
  }

  const rest = sections.filter((section) => section !== "session_history");
  return ["session_history", ...rest];
}

export function shouldShowStudioSection(
  project: Project,
  section: StudioSection,
  studio?: Studio
): boolean {
  switch (section) {
    case "deposit_awaiting":
      return isAwaitingDepositPayment(project);
    case "deposit_review":
      return project.status === "deposit_submitted";
    case "assets":
      return shouldShowAssetsSection(project);
    case "session_history":
      return shouldShowSessionHistory(project);
    case "pre_session_documents":
      if (!studio || !hasPreSessionDocumentsToShow(project, studio)) {
        return false;
      }
      return (
        hasPendingInPersonDocuments(project, studio) ||
        allRequiredPreSessionDocumentsComplete(project, studio)
      );
    case "portal_link":
      return true;
    default:
      return true;
  }
}

function visibleSections(
  project: Project,
  sections: StudioSection[],
  studio?: Studio
): StudioSection[] {
  return sections.filter((section) =>
    shouldShowStudioSection(project, section, studio)
  );
}

function buildZones(
  project: Project,
  groups: StudioLayoutZoneGroup[],
  studio?: Studio
): StudioLayoutZoneGroup[] {
  return groups
    .map((group) => ({
      zone: group.zone,
      sections: visibleSections(project, group.sections, studio),
    }))
    .filter((group) => group.sections.length > 0);
}

function preSessionDocumentZones(
  project: Project,
  studio: Studio
): StudioSection[] {
  if (!hasPreSessionDocumentsToShow(project, studio)) {
    return [];
  }

  if (hasPendingInPersonDocuments(project, studio)) {
    return ["pre_session_documents"];
  }

  if (allRequiredPreSessionDocumentsComplete(project, studio)) {
    return ["pre_session_documents"];
  }

  return [];
}

export function getStudioProjectLayout(
  project: Project,
  studio?: Studio
): StudioLayoutZoneGroup[] {
  const preSessionAction =
    studio && hasPendingInPersonDocuments(project, studio)
      ? (["pre_session_documents"] as StudioSection[])
      : [];
  const preSessionReference =
    studio &&
    !hasPendingInPersonDocuments(project, studio) &&
    preSessionDocumentZones(project, studio).length > 0
      ? (["pre_session_documents"] as StudioSection[])
      : [];

  switch (project.status) {
    case "pending_brief":
      return buildZones(project, [
        {
          zone: "reference",
          sections: ["brief", "intake", "quote_form", "portal_link"],
        },
      ], studio);

    case "quoting":
      return buildZones(project, [
        {
          zone: "action",
          sections:
            getCurrentSessionIndex(project) > 1 || getBookedSessionCount(project) > 0
              ? ["quote_form", "assets"]
              : ["quote_form"],
        },
        {
          zone: "reference",
          sections: referenceSections(project, [
            "brief",
            "session_history",
            "intake",
            "portal_link",
          ]),
        },
      ], studio);

    case "pending_payment":
      return buildZones(project, [
        {
          zone: "action",
          sections: ["deposit_awaiting", "quote_form", "assets"],
        },
        {
          zone: "reference",
          sections: ["session_history", "brief", "intake", "portal_link"],
        },
      ], studio);

    case "deposit_submitted":
      return buildZones(project, [
        {
          zone: "action",
          sections: ["deposit_review", "assets"],
        },
        {
          zone: "reference",
          sections: [
            "session_history",
            "brief",
            "intake",
            "quote_form",
            "portal_link",
          ],
        },
      ], studio);

    case "booked":
      return buildZones(project, [
        {
          zone: "action",
          sections: [...preSessionAction, "assets"],
        },
        {
          zone: "reference",
          sections: [
            ...preSessionReference,
            "session_history",
            "quote_form",
            "brief",
            "intake",
            "portal_link",
          ],
        },
      ], studio);

    case "completed":
      return buildZones(project, [
        {
          zone: "action",
          sections: ["assets"],
        },
        {
          zone: "reference",
          sections: [
            ...preSessionReference,
            "session_history",
            "brief",
            "intake",
            "quote_form",
            "portal_link",
          ],
        },
      ], studio);

    case "cancelled":
      return buildZones(project, [
        {
          zone: "reference",
          sections: ["session_history", "brief", "intake", "portal_link"],
        },
      ], studio);
  }
}
