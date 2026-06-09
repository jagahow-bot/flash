import { ensurePreSessionDocumentRecords } from "@/lib/pre-session-documents/records";
import { canClientAccessProject } from "@/lib/project/client-access";
import { shouldExpireDepositDeadline } from "@/lib/project/deposit-deadline";
import { requiresDepositForCurrentSession } from "@/lib/project/session-schedule";
import { getProjectById, updateProjectFields } from "@/lib/firestore/projects.server";
import { getStudioBySlug } from "@/lib/firestore/studios.server";
import { notifyDepositSubmitted } from "@/lib/email/project-notifications.server";
import type { Project } from "@/types/project";
import type { User } from "@/types/user";

export type DepositSubmitResult =
  | { ok: true; project: Project }
  | { ok: false; status: number; error: string };

export async function submitClientDepositProof({
  client,
  projectId,
  studioSlug,
  depositProofUrl,
}: {
  client: User;
  projectId: string;
  studioSlug: string;
  depositProofUrl: string;
}): Promise<DepositSubmitResult> {
  const [studio, project] = await Promise.all([
    getStudioBySlug(studioSlug),
    getProjectById(projectId),
  ]);

  if (!studio || !project || project.studioId !== studio.studioId) {
    return { ok: false, status: 404, error: "找不到此預約" };
  }

  if (!canClientAccessProject(project, client)) {
    return { ok: false, status: 403, error: "無權限操作此預約" };
  }

  if (project.status !== "pending_payment") {
    return { ok: false, status: 403, error: "目前無法確認時段" };
  }

  if (shouldExpireDepositDeadline(project)) {
    return { ok: false, status: 400, error: "訂金期限已過，請重新選擇時段" };
  }

  const requiresDeposit = requiresDepositForCurrentSession(project);
  if (!requiresDeposit) {
    return { ok: false, status: 400, error: "此預約無需上傳訂金證明" };
  }

  if (!project.confirmedTimeSlot) {
    return { ok: false, status: 400, error: "請先選擇時段" };
  }

  const nextProject: Project = {
    ...project,
    status: "deposit_submitted",
    proposedTimeSlots: [],
    depositProofUrl,
    depositSubmittedAt: new Date(),
    slotSelectedAt: undefined,
    depositDeadlineAt: undefined,
  };

  const records = ensurePreSessionDocumentRecords(nextProject, studio);
  if (records) {
    nextProject.preSessionDocumentRecords = records;
  }

  await updateProjectFields(projectId, nextProject);
  notifyDepositSubmitted(nextProject);

  return { ok: true, project: nextProject };
}
