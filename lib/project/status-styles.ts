import type { Project } from "@/types/project";

export const PROJECT_STATUS_STYLES: Record<Project["status"], string> = {
  pending_brief: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  quoting: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  pending_payment: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200",
  deposit_submitted:
    "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200",
  booked: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground line-through",
};

export const PROJECT_SUB_STATUS_STYLES: Record<string, string> = {
  ...PROJECT_STATUS_STYLES,
  awaitingAssets: "bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200",
  awaitingSession: "bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200",
  awaitingSignature:
    "bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200",
  awaitingDeposit:
    "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200",
  awaitingQuote: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
};

export function getProjectStatusStyleClass(
  styleKey: string,
  status: Project["status"],
): string {
  return PROJECT_SUB_STATUS_STYLES[styleKey] ?? PROJECT_STATUS_STYLES[status];
}
