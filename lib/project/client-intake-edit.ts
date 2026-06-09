import type { Project, ProjectStatus } from "@/types/project";

/** 客戶可自行更新需求的專案狀態（已預約／完成後鎖定） */
const CLIENT_EDITABLE_STATUSES: ProjectStatus[] = [
  "pending_brief",
  "quoting",
  "pending_payment",
];

export function canClientEditIntake(
  status: ProjectStatus,
  pendingIntakeRevision?: boolean
): boolean {
  if (pendingIntakeRevision) {
    return true;
  }

  return CLIENT_EDITABLE_STATUSES.includes(status);
}

export function canClientEditProject(project: Pick<Project, "status" | "pendingIntakeRevision">): boolean {
  return canClientEditIntake(project.status, project.pendingIntakeRevision);
}
