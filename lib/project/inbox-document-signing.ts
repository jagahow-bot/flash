import {
  getPreSessionRecords,
  getStudioDocumentTemplates,
  isPreSessionActiveStatus,
} from "@/lib/pre-session-documents/records";
import type { AppDictionary } from "@/lib/i18n/app-types";
import type { Project } from "@/types/project";
import type { Studio } from "@/types/studio";

export type InboxDocumentSigningStatus =
  | "not_applicable"
  | "pending_client"
  | "signed";

export function getInboxDocumentSigningStatus(
  project: Project,
  studio?: Studio,
): InboxDocumentSigningStatus {
  if (!studio) {
    return "not_applicable";
  }

  const hasOnlineTemplates = getStudioDocumentTemplates(studio).some(
    (template) => template.signatureMode === "online_advance",
  );
  if (!hasOnlineTemplates) {
    return "not_applicable";
  }

  if (!isPreSessionActiveStatus(project.status)) {
    return "not_applicable";
  }

  const onlineRecords = getPreSessionRecords(project, studio).filter(
    (record) => record.signatureMode === "online_advance",
  );
  if (onlineRecords.length === 0) {
    return "not_applicable";
  }

  if (onlineRecords.some((record) => record.status === "pending")) {
    return "pending_client";
  }

  return "signed";
}

export function getInboxDocumentSigningLabel(
  status: InboxDocumentSigningStatus,
  dict: AppDictionary,
): string {
  switch (status) {
    case "pending_client":
      return dict.dashboard.documentSigningPending;
    case "signed":
      return dict.dashboard.documentSigningSigned;
    case "not_applicable":
      return dict.dashboard.documentSigningNotApplicable;
  }
}

export function getInboxDocumentSigningStyleClass(
  status: InboxDocumentSigningStatus,
): string {
  switch (status) {
    case "pending_client":
      return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200";
    case "signed":
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200";
    case "not_applicable":
      return "bg-muted text-muted-foreground";
  }
}
