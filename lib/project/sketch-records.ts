import type { Project } from "@/types/project";
import type { ProjectSketchRecord } from "@/types/project-sketch";

const LEGACY_EPOCH = new Date(0);

/** 由 sketches[] 合成紀錄（無日期與說明） */
export function synthesizeSketchRecordsFromUrls(
  urls: string[]
): ProjectSketchRecord[] {
  return urls.map((url, index) => ({
    id: `legacy-${index}-${url.slice(-12)}`,
    url,
    uploadedAt: LEGACY_EPOCH,
  }));
}

/** 取得設計稿紀錄；若僅有 sketches[] 則於讀取時合成 */
export function getSketchRecords(
  project: Pick<Project, "sketches" | "sketchRecords">
): ProjectSketchRecord[] {
  if (project.sketchRecords && project.sketchRecords.length > 0) {
    return [...project.sketchRecords];
  }
  return synthesizeSketchRecordsFromUrls(project.sketches);
}

/** 依上傳時間排序（舊 → 新） */
export function sortSketchRecordsChronological(
  records: ProjectSketchRecord[]
): ProjectSketchRecord[] {
  return [...records].sort(
    (a, b) => a.uploadedAt.getTime() - b.uploadedAt.getTime()
  );
}

/** 顯示用：最新在上 */
export function sortSketchRecordsNewestFirst(
  records: ProjectSketchRecord[]
): ProjectSketchRecord[] {
  return sortSketchRecordsChronological(records).reverse();
}

export function syncSketchesFromRecords(
  records: ProjectSketchRecord[]
): string[] {
  return sortSketchRecordsChronological(records).map((record) => record.url);
}

export function normalizeProjectSketches(project: Project): Project {
  const records = sortSketchRecordsChronological(getSketchRecords(project));
  return {
    ...project,
    sketchRecords: records.length > 0 ? records : undefined,
    sketches: records.map((record) => record.url),
  };
}

export function isLegacySketchDate(date: Date): boolean {
  return date.getTime() === LEGACY_EPOCH.getTime();
}

export function getSketchVersionNumber(
  record: ProjectSketchRecord,
  chronologicalRecords: ProjectSketchRecord[]
): number {
  const index = chronologicalRecords.findIndex((item) => item.id === record.id);
  return index >= 0 ? index + 1 : chronologicalRecords.length;
}

export function appendSketchRecords(
  existing: ProjectSketchRecord[],
  additions: ProjectSketchRecord[]
): ProjectSketchRecord[] {
  return sortSketchRecordsChronological([...existing, ...additions]);
}
