"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { formatDateKey, formatMonthDay } from "@/lib/project/format";
import { getClosureForDate } from "@/lib/availability/closures";
import {
  getScheduleCalendarEntries,
  type ScheduleCalendarEntry,
} from "@/lib/project/schedule-calendar";
import { formatSessionSlotLabel } from "@/lib/project/session-schedule";
import type { Artist } from "@/types/artist";
import type { Project } from "@/types/project";
import type { StudioClosure } from "@/types/studio-closure";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getSessionIndexForSlot(
  project: Project,
  slotStart: Date
): number {
  const slots = project.confirmedTimeSlots ?? [];
  const index = slots.findIndex(
    (slot) => new Date(slot.startTime).getTime() === slotStart.getTime()
  );

  if (index >= 0) {
    return index + 1;
  }

  return slots.length > 0 ? slots.length : 1;
}

function ScheduleEntryLink({
  entry,
  artistName,
  dict,
}: {
  entry: ScheduleCalendarEntry;
  artistName?: string;
  dict: ReturnType<typeof useAppDictionary>;
}) {
  const { project, slot, kind } = entry;
  const sessionIndex = getSessionIndexForSlot(project, slot.startTime);
  const d = dict.dashboard;

  return (
    <Link
      href={`/dashboard/projects/${project.projectId}`}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/40",
        kind === "completed" && "border-muted bg-muted/20",
        kind === "held" && "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20"
      )}
    >
      <p className="font-medium">
        {project.intakeForm.placement}
        {kind === "held" && (
          <span className="ml-1.5 text-xs font-normal text-amber-800 dark:text-amber-200">
            {d.statusAwaitingDeposit}
          </span>
        )}
        {project.status === "deposit_submitted" && (
          <span className="ml-1.5 text-xs font-normal text-violet-700 dark:text-violet-300">
            {d.statusDepositReview}
          </span>
        )}
        {kind === "completed" && (
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            {d.statusCompleted}
          </span>
        )}
      </p>
      {artistName && (
        <p className="text-xs text-muted-foreground">{artistName}</p>
      )}
      <p className="text-muted-foreground">
        {formatSessionSlotLabel(project, slot, sessionIndex, dict)}
      </p>
    </Link>
  );
}

export function SchedulePanel({
  projects,
  artists,
  closures = [],
}: {
  projects: Project[];
  artists: Artist[];
  closures?: StudioClosure[];
}) {
  const dict = useAppDictionary();
  const d = dict.dashboard;
  const s = dict.schedule;
  const c = dict.common;

  const artistNames = useMemo(
    () => new Map(artists.map((artist) => [artist.artistId, artist.displayName])),
    [artists]
  );
  const [viewDate, setViewDate] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [upcomingCutoff] = useState(() => Date.now());

  const calendarEntries = useMemo(
    () => getScheduleCalendarEntries(projects),
    [projects]
  );

  const upcomingEntries = useMemo(() => {
    return calendarEntries.filter(
      (entry) =>
        entry.kind !== "completed" &&
        entry.slot.startTime.getTime() >= upcomingCutoff
    );
  }, [calendarEntries, upcomingCutoff]);

  const selectedDayEntries = useMemo(() => {
    if (!selectedDate) return [];
    const key = formatDateKey(selectedDate);
    return calendarEntries.filter(
      (entry) => formatDateKey(entry.slot.startTime) === key
    );
  }, [calendarEntries, selectedDate]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{d.upcomingSchedule}</CardTitle>
        <CardDescription>{s.scheduleDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-stretch gap-2">
          <MiniCalendar
            viewDate={viewDate}
            onViewDateChange={(date) => {
              setViewDate(date);
              setSelectedDate(null);
            }}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            calendarEntries={calendarEntries}
            closures={closures}
          />

          <div className="flex min-h-[10rem] min-w-0 flex-1 flex-col rounded-lg border">
            {selectedDate ? (
              <>
                <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
                  <p className="text-sm font-medium">
                    {formatMonthDay(selectedDate, dict.dates, { weekday: true })}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={c.backToUpcomingAria}
                    onClick={() => setSelectedDate(null)}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
                  {(() => {
                    const closure = getClosureForDate(closures, selectedDate);
                    if (closure) {
                      return (
                        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100">
                          {d.studioClosed}
                          {closure.label ? `：${closure.label}` : ""}
                        </p>
                      );
                    }
                    return null;
                  })()}
                  {selectedDayEntries.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {s.noScheduleThisDay}
                    </p>
                  ) : (
                    selectedDayEntries.map((entry) => (
                      <ScheduleEntryLink
                        key={`${entry.project.projectId}-${entry.slot.startTime.toISOString()}`}
                        entry={entry}
                        artistName={
                          artistNames.get(entry.project.artistId) ?? undefined
                        }
                        dict={dict}
                      />
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col gap-2 p-3">
                <p className="text-sm font-medium">{d.upcoming}</p>
                {upcomingEntries.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {d.noUpcoming}
                  </p>
                ) : (
                  upcomingEntries.map((entry) => (
                    <ScheduleEntryLink
                      key={`${entry.project.projectId}-${entry.slot.startTime.toISOString()}`}
                      entry={entry}
                      artistName={
                        artistNames.get(entry.project.artistId) ?? undefined
                      }
                      dict={dict}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
