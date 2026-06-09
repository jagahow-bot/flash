import { formatDateKey } from "@/lib/project/format";
import type { StudioClosure } from "@/types/studio-closure";

export function normalizeClosures(input?: unknown): StudioClosure[] {
  if (!Array.isArray(input)) return [];

  const closures: StudioClosure[] = [];

  for (const item of input) {
    if (!item || typeof item !== "object") continue;

    const record = item as Partial<StudioClosure>;
    if (typeof record.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
      continue;
    }

    closures.push({
      date: record.date,
      label: typeof record.label === "string" ? record.label.trim() : undefined,
    });
  }

  return closures.sort((a, b) => a.date.localeCompare(b.date));
}

export function isStudioClosedOnDate(
  closures: StudioClosure[],
  date: Date
): boolean {
  const key = formatDateKey(date);
  return closures.some((closure) => closure.date === key);
}

export function getClosureForDate(
  closures: StudioClosure[],
  date: Date
): StudioClosure | null {
  const key = formatDateKey(date);
  return closures.find((closure) => closure.date === key) ?? null;
}

export function getClosureDateSet(closures: StudioClosure[]): Set<string> {
  return new Set(closures.map((closure) => closure.date));
}
