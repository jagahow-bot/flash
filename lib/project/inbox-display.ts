import { formatIntakeSizeFromForm } from "@/lib/intake/display";
import type { AppDictionary } from "@/lib/i18n/app-types";
import type { Project } from "@/types/project";
import type { RiskFlag, RiskFlagLevel } from "@/types/tattoo-brief";

const SUMMARY_MAX_LENGTH = 60;
const FLAG_REASON_MAX_LENGTH = 50;

export function truncateInboxText(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}…`;
}

export function getInboxProjectSize(project: Project): string {
  return (
    project.tattooBrief?.photoSizeEstimate?.estimatedSize?.trim() ||
    formatIntakeSizeFromForm(project.intakeForm) ||
    "—"
  );
}

function sortRiskFlags(flags: RiskFlag[]): RiskFlag[] {
  const priority: Record<RiskFlagLevel, number> = { danger: 0, warning: 1 };
  return [...flags].sort((a, b) => priority[a.level] - priority[b.level]);
}

export function getInboxProjectSummary(
  project: Project,
  dict: AppDictionary,
): {
  summary: string;
  riskFlags: { level: RiskFlagLevel; reason: string }[];
} {
  const inboxSummary = project.tattooBrief?.inboxSummary?.trim();
  const intakeDescription = project.intakeForm.description?.trim();
  const rawSummary =
    inboxSummary ||
    (intakeDescription
      ? truncateInboxText(intakeDescription, SUMMARY_MAX_LENGTH)
      : null);
  const summary = rawSummary ?? dict.status.inbox.briefProcessing;

  const riskFlags = sortRiskFlags(
    (project.tattooBrief?.riskFlags ?? []).filter(
      (flag) => flag.level === "danger" || flag.level === "warning"
    )
  )
    .slice(0, 2)
    .map((flag) => ({
      level: flag.level,
      reason: truncateInboxText(flag.reason, FLAG_REASON_MAX_LENGTH),
    }));

  return { summary, riskFlags };
}
