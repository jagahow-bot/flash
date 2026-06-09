import type {
  PreSessionDocumentRecord,
  PreSessionDocumentTemplate,
} from "@/types/pre-session-document";
import type { Project, ProjectStatus } from "@/types/project";
import type { Studio } from "@/types/studio";

const PRE_SESSION_ACTIVE_STATUSES = new Set<ProjectStatus>([
  "deposit_submitted",
  "booked",
  "completed",
]);

export function isPreSessionActiveStatus(status: ProjectStatus): boolean {
  return PRE_SESSION_ACTIVE_STATUSES.has(status);
}

export function getStudioDocumentTemplates(
  studio: Studio
): PreSessionDocumentTemplate[] {
  return [...(studio.preSessionDocuments ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
}

export function buildPreSessionRecordsFromTemplates(
  templates: PreSessionDocumentTemplate[]
): PreSessionDocumentRecord[] {
  return templates.map((template) => ({
    documentId: template.documentId,
    title: template.title,
    signatureMode: template.signatureMode,
    status: "pending",
    isRequired: template.isRequired,
  }));
}

export function ensurePreSessionDocumentRecords(
  project: Project,
  studio: Studio
): PreSessionDocumentRecord[] | undefined {
  const templates = getStudioDocumentTemplates(studio);
  if (templates.length === 0) {
    return project.preSessionDocumentRecords;
  }

  if (!isPreSessionActiveStatus(project.status)) {
    return project.preSessionDocumentRecords;
  }

  const existing = project.preSessionDocumentRecords ?? [];
  if (existing.length > 0) {
    const templateIds = new Set(templates.map((t) => t.documentId));
    const merged = [
      ...existing.filter((record) => templateIds.has(record.documentId)),
      ...buildPreSessionRecordsFromTemplates(
        templates.filter(
          (template) =>
            !existing.some((record) => record.documentId === template.documentId)
        )
      ),
    ];
    return merged;
  }

  return buildPreSessionRecordsFromTemplates(templates);
}

export function getPreSessionRecords(
  project: Project,
  studio: Studio
): PreSessionDocumentRecord[] {
  return ensurePreSessionDocumentRecords(project, studio) ?? [];
}

export function hasPendingInPersonDocuments(
  project: Project,
  studio: Studio
): boolean {
  return getPreSessionRecords(project, studio).some(
    (record) =>
      record.signatureMode === "in_person" &&
      record.status === "pending" &&
      record.isRequired
  );
}

export function hasPendingOnlineDocuments(
  project: Project,
  studio: Studio
): boolean {
  return getPreSessionRecords(project, studio).some(
    (record) =>
      record.signatureMode === "online_advance" && record.status === "pending"
  );
}

export function hasPreSessionDocumentsToShow(
  project: Project,
  studio: Studio
): boolean {
  return (
    getStudioDocumentTemplates(studio).length > 0 &&
    isPreSessionActiveStatus(project.status)
  );
}

export function hasClientPendingPreSessionDocuments(
  project: Project,
  studio: Studio
): boolean {
  if (!hasPreSessionDocumentsToShow(project, studio)) {
    return false;
  }

  return getPreSessionRecords(project, studio).some(
    (record) => record.status === "pending"
  );
}

export function allRequiredPreSessionDocumentsComplete(
  project: Project,
  studio: Studio
): boolean {
  const records = getPreSessionRecords(project, studio).filter(
    (record) => record.isRequired
  );
  if (records.length === 0) return true;
  return records.every((record) => record.status === "completed");
}

export function getTemplateByDocumentId(
  studio: Studio,
  documentId: string
): PreSessionDocumentTemplate | undefined {
  return studio.preSessionDocuments?.find(
    (template) => template.documentId === documentId
  );
}
