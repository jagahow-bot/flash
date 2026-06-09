import { canClientAccessProject } from "@/lib/project/client-access";
import {
  ensurePreSessionDocumentRecords,
  getPreSessionRecords,
  isPreSessionActiveStatus,
} from "@/lib/pre-session-documents/records";
import { notifyPreSessionDocumentCompleted } from "@/lib/email/project-notifications.server";
import {
  getProjectById,
  updateProjectFields,
} from "@/lib/firestore/projects.server";
import { getStudioBySlug } from "@/lib/firestore/studios.server";
import type { PreSessionDocumentRecord } from "@/types/pre-session-document";
import type { Project } from "@/types/project";
import type { User } from "@/types/user";

function updateRecord(
  records: PreSessionDocumentRecord[],
  documentId: string,
  patch: Partial<PreSessionDocumentRecord>
): PreSessionDocumentRecord[] {
  return records.map((record) =>
    record.documentId === documentId ? { ...record, ...patch } : record
  );
}

export type ClientPreSessionSignResult =
  | { ok: true; documentId: string }
  | { ok: false; status: number; error: string };

export async function submitClientPreSessionSignature({
  client,
  projectId,
  studioSlug,
  documentId,
  fileUrl,
  clientSignatureDataUrl,
}: {
  client: User;
  projectId: string;
  studioSlug: string;
  documentId: string;
  fileUrl: string;
  clientSignatureDataUrl?: string;
}): Promise<ClientPreSessionSignResult> {
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

  if (!isPreSessionActiveStatus(project.status)) {
    return { ok: false, status: 403, error: "目前無法簽署術前文件" };
  }

  const records =
    ensurePreSessionDocumentRecords(project, studio) ??
    getPreSessionRecords(project, studio);
  const record = records.find((item) => item.documentId === documentId);

  if (!record) {
    return { ok: false, status: 404, error: "找不到此文件" };
  }

  if (record.signatureMode !== "online_advance") {
    return { ok: false, status: 400, error: "此文件需到店實體簽名" };
  }

  if (record.status === "completed") {
    return { ok: false, status: 400, error: "此文件已完成" };
  }

  const nextRecords = updateRecord(records, documentId, {
    status: "completed",
    completedAt: new Date(),
    completionMethod: "client_signature",
    fileUrl,
    signedByUserId: client.uid,
    clientSignatureDataUrl,
  });

  const nextProject: Project = {
    ...project,
    preSessionDocumentRecords: nextRecords,
  };

  await updateProjectFields(projectId, nextProject);

  notifyPreSessionDocumentCompleted(nextProject, studio, {
    documentTitle: record.title,
    completionMethod: "client_signature",
  });

  return { ok: true, documentId };
}
