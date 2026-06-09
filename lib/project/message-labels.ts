import type { AppDictionary } from "@/lib/i18n/app-types";
import type { ProjectMessageKind } from "@/types/project-message";

export function getProjectMessageKindLabel(
  kind: ProjectMessageKind,
  dict: AppDictionary["project"],
): string {
  switch (kind) {
    case "request_intake_revision":
      return dict.messageKindRevision;
    case "request_confirmation":
      return dict.messageKindConfirmation;
    case "client_confirmed":
      return dict.messageKindClientConfirmed;
    default:
      return dict.messageKindMessage;
  }
}
