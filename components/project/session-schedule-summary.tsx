import type { AppDictionary } from "@/lib/i18n/app-types";
import {
  formatSessionSlotLabel,
  getSessionProgressLabel,
} from "@/lib/project/session-schedule";
import type { Project } from "@/types/project";

export function SessionScheduleSummary({
  project,
  dict,
}: {
  project: Project;
  dict: AppDictionary;
}) {
  const progress = getSessionProgressLabel(project, dict.project);
  const slots = project.confirmedTimeSlots ?? [];

  if (!progress && slots.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border/70 bg-background/70 px-4 py-3 text-sm">
      {progress ? <p className="font-medium">{progress}</p> : null}
      {slots.length > 0 ? (
        <ul className={`flex flex-col gap-1 ${progress ? "mt-2" : ""}`}>
          {slots.map((slot, index) => (
            <li
              key={`${slot.startTime.toISOString()}-${index}`}
              className="text-muted-foreground"
            >
              {formatSessionSlotLabel(project, slot, index + 1, dict)}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
