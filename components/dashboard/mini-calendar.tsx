"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { formatMessage } from "@/lib/i18n/format";
import { getMonthGrid } from "@/lib/availability/schedule";
import { formatDateKey, formatYearMonth } from "@/lib/project/format";
import { getClosureForDate } from "@/lib/availability/closures";
import type { ScheduleCalendarEntry } from "@/lib/project/schedule-calendar";
import type { StudioClosure } from "@/types/studio-closure";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MiniCalendarProps {
  viewDate: Date;
  onViewDateChange: (date: Date) => void;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  calendarEntries: ScheduleCalendarEntry[];
  closures?: StudioClosure[];
}

interface DayCalendarCounts {
  held: number;
  active: number;
  completed: number;
}

function buildCalendarCountsByDate(
  entries: ScheduleCalendarEntry[]
): Map<string, DayCalendarCounts> {
  const counts = new Map<string, DayCalendarCounts>();

  for (const entry of entries) {
    const key = formatDateKey(entry.slot.startTime);
    const current = counts.get(key) ?? { held: 0, active: 0, completed: 0 };

    if (entry.kind === "completed") {
      current.completed += 1;
    } else if (entry.kind === "held") {
      current.held += 1;
    } else {
      current.active += 1;
    }

    counts.set(key, current);
  }

  return counts;
}

export function MiniCalendar({
  viewDate,
  onViewDateChange,
  selectedDate,
  onSelectDate,
  calendarEntries,
  closures = [],
}: MiniCalendarProps) {
  const dict = useAppDictionary();
  const d = dict.dashboard;
  const s = dict.schedule;
  const weekdays = d.weekdayShort;
  const today = new Date();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = formatYearMonth(viewDate, dict.dates);

  const countsByDate = useMemo(
    () => buildCalendarCountsByDate(calendarEntries),
    [calendarEntries]
  );

  const monthSummary = useMemo(() => {
    const entries: Array<{ date: Date; total: number }> = [];

    countsByDate.forEach((counts, key) => {
      const [y, m, d] = key.split("-").map(Number);
      if (y === year && m === month + 1) {
        entries.push({
          date: new Date(y, m - 1, d),
          total: counts.held + counts.active + counts.completed,
        });
      }
    });

    return entries.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [countsByDate, year, month]);

  const cells = getMonthGrid(year, month);

  function shiftMonth(delta: number) {
    onViewDateChange(
      new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1)
    );
  }

  return (
    <div className="w-full shrink-0 rounded-lg border p-1.5 md:w-[10.5rem]">
      <div className="mb-2 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => shiftMonth(-1)}
        >
          <ChevronLeft className="size-3.5" />
        </Button>
        <span className="text-xs font-medium">{monthLabel}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => shiftMonth(1)}
        >
          <ChevronRight className="size-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] text-muted-foreground">
        {weekdays.map((day) => (
          <div key={day} className="py-0.5">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((cell) => {
          if (!cell.date) {
            return <div key={cell.key} className="h-7" />;
          }

          const key = formatDateKey(cell.date);
          const dayCounts = countsByDate.get(key) ?? {
            held: 0,
            active: 0,
            completed: 0,
          };
          const totalCount =
            dayCounts.held + dayCounts.active + dayCounts.completed;
          const hasSchedule = totalCount > 0;
          const closure = getClosureForDate(closures, cell.date);
          const isToday = key === formatDateKey(today);
          const isSelected =
            selectedDate !== null && formatDateKey(selectedDate) === key;

          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => onSelectDate(cell.date!)}
              aria-label={
                closure
                  ? formatMessage(s.calendarDayClosure, {
                      day: cell.date.getDate(),
                      label: closure.label ? `：${closure.label}` : "",
                    })
                  : hasSchedule
                    ? formatMessage(s.calendarDayCount, {
                        day: cell.date.getDate(),
                        count: totalCount,
                      })
                    : formatMessage(s.calendarDayPlain, {
                        day: cell.date.getDate(),
                      })
              }
              title={
                closure
                  ? closure.label ?? d.studioClosed
                  : hasSchedule
                    ? formatMessage(s.daySummaryHeld, {
                        held: dayCounts.held,
                        active: dayCounts.active,
                        completed: dayCounts.completed,
                      })
                    : undefined
              }
              className={cn(
                "relative flex h-7 items-center justify-center rounded-sm text-xs transition-colors hover:bg-muted/60",
                closure &&
                  !isSelected &&
                  "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200",
                isSelected &&
                  "bg-sky-100 text-sky-900 ring-2 ring-sky-300 ring-offset-1 hover:bg-sky-100 dark:bg-sky-500/25 dark:text-sky-50 dark:ring-sky-500/50",
                isToday &&
                  !isSelected &&
                  "font-bold text-sky-700 ring-1 ring-inset ring-sky-300/80 dark:text-sky-300 dark:ring-sky-600/60"
              )}
            >
              {cell.date.getDate()}
              {closure && !isSelected && (
                <span
                  className="absolute bottom-0.5 size-1 rounded-full bg-rose-500"
                  aria-hidden
                />
              )}
              {hasSchedule && !isSelected && totalCount > 1 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-sky-500 text-[8px] font-bold text-white">
                  {totalCount}
                </span>
              )}
              {hasSchedule && !isSelected && dayCounts.held > 0 && (
                <span
                  className={cn(
                    "absolute bottom-0.5 size-1 rounded-full bg-amber-500",
                    (dayCounts.active > 0 || dayCounts.completed > 0) &&
                      "left-[calc(50%-6px)]"
                  )}
                  aria-hidden
                />
              )}
              {hasSchedule && !isSelected && dayCounts.active > 0 && (
                <span
                  className={cn(
                    "absolute bottom-0.5 size-1 rounded-full bg-sky-500",
                    dayCounts.held > 0 && "left-[calc(50%)]",
                    dayCounts.completed > 0 &&
                      !dayCounts.held &&
                      "left-[calc(50%-3px)]",
                    dayCounts.held > 0 &&
                      dayCounts.completed > 0 &&
                      "left-[calc(50%)]"
                  )}
                  aria-hidden
                />
              )}
              {hasSchedule && !isSelected && dayCounts.completed > 0 && (
                <span
                  className={cn(
                    "absolute bottom-0.5 size-1 rounded-full bg-muted-foreground",
                    (dayCounts.active > 0 || dayCounts.held > 0) &&
                      "left-[calc(50%+6px)]",
                    dayCounts.active > 0 &&
                      !dayCounts.held &&
                      "left-[calc(50%+3px)]"
                  )}
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex flex-col gap-1">
        <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="inline-block size-1.5 rounded-full bg-amber-500" />
          {s.legendHeldDeposit}
        </p>
        <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="inline-block size-1.5 rounded-full bg-sky-500" />
          {s.legendActive}
        </p>
        <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="inline-block size-1.5 rounded-full bg-muted-foreground" />
          {s.legendCompleted}
        </p>
        {closures.length > 0 && (
          <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="inline-block size-1.5 rounded-full bg-rose-500" />
            {d.studioClosed}
          </p>
        )}
        {monthSummary.length > 0 ? (
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            {s.thisMonth}{" "}
            {monthSummary.map(({ date, total }, index) => (
              <span key={formatDateKey(date)}>
                {index > 0 ? "、" : ""}
                <button
                  type="button"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                  onClick={() => onSelectDate(date)}
                >
                  {date.getMonth() + 1}/{date.getDate()}
                </button>
                {total > 1 ? `(${total})` : ""}
              </span>
            ))}
          </p>
        ) : (
          <p className="text-[10px] text-muted-foreground">{s.noScheduleThisMonth}</p>
        )}
      </div>
    </div>
  );
}
