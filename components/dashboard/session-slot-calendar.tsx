"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { formatMessage } from "@/lib/i18n/format";
import { DayScheduleView } from "@/components/dashboard/day-schedule-view";
import {
  formatAvailabilitySlot,
  getEffectiveOperatingHours,
} from "@/lib/availability/slots";
import {
  dateHasClientPreference,
  getDayScheduleSummary,
  getMonthGrid,
} from "@/lib/availability/schedule";
import {
  formatDateKey,
  formatYearMonth,
  formatTimeSlot,
} from "@/lib/project/format";
import type { TimeSlot } from "@/types/session-details";
import type { StudioOperatingHours } from "@/types/operating-hours";
import type { StudioClosure } from "@/types/studio-closure";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SessionSlotCalendarProps {
  operatingHours: StudioOperatingHours;
  sessions: number;
  hoursPerSession: number;
  occupiedSlots: TimeSlot[];
  value: TimeSlot[];
  clientAvailability?: string[];
  closures?: StudioClosure[];
  onChange: (slots: TimeSlot[]) => void;
  readOnly?: boolean;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function SessionSlotCalendar({
  operatingHours,
  sessions,
  hoursPerSession,
  occupiedSlots,
  value,
  clientAvailability = [],
  closures = [],
  onChange,
  readOnly = false,
}: SessionSlotCalendarProps) {
  const dict = useAppDictionary();
  const q = dict.quote;
  const c = dict.common;
  const d = dict.dashboard;
  const b = dict.booking;
  const slotLabels = {
    days: b.availabilityDays,
    periods: b.availabilityPeriods,
    separator: b.availabilitySlotSeparator,
  };
  const formattedClientAvailability = useMemo(
    () =>
      clientAvailability.map((slot) => formatAvailabilitySlot(slot, slotLabels)),
    [clientAvailability, b.availabilityDays, b.availabilityPeriods, b.availabilitySlotSeparator]
  );
  const weekdays = d.weekdayShort;
  const effectiveHours = getEffectiveOperatingHours(operatingHours);
  const [viewDate, setViewDate] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = formatYearMonth(viewDate, dict.dates);

  const cells = useMemo(() => getMonthGrid(year, month), [year, month]);
  const sessionHours = Math.max(1, hoursPerSession || 1);

  function shiftMonth(delta: number) {
    setViewDate((current) =>
      new Date(current.getFullYear(), current.getMonth() + delta, 1)
    );
    setSelectedDate(null);
  }

  function handleDateClick(date: Date, canOpen: boolean) {
    if (readOnly || !canOpen) return;
    setSelectedDate(date);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        {q.calendarInstructions}
        {clientAvailability.length > 0 && (
          <span className="text-amber-700 dark:text-amber-300">
            {formatMessage(q.clientPreferenceLegend, {
              labels: formattedClientAvailability.join("、"),
            })}
          </span>
        )}
      </p>

      <div className="flex flex-row items-stretch gap-2">
        {/* Compact month calendar (left) */}
        <div className="w-[10.5rem] shrink-0 rounded-lg border p-1.5">
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

              const summary = getDayScheduleSummary(
                cell.date,
                sessionHours,
                effectiveHours,
                occupiedSlots,
                value,
                closures
              );
              const isToday =
                formatDateKey(cell.date) === formatDateKey(new Date());
              const isActive =
                selectedDate !== null &&
                formatDateKey(selectedDate) === formatDateKey(cell.date);
              const isClientPreferredDay = dateHasClientPreference(
                cell.date,
                clientAvailability
              );

              return (
                <button
                  key={cell.key}
                  type="button"
                  disabled={readOnly || !summary.canOpen}
                  onClick={() => handleDateClick(cell.date!, summary.canOpen)}
                  className={cn(
                    "relative flex h-7 items-center justify-center rounded-sm text-xs transition-colors",
                    summary.isClosed && "text-muted-foreground/40",
                    summary.isStudioClosure &&
                      !isActive &&
                      "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200",
                    summary.isPast && "text-muted-foreground/40",
                    summary.canOpen && "hover:bg-primary/10",
                    isActive && "bg-primary text-primary-foreground hover:bg-primary",
                    isToday && !isActive && "font-bold text-primary",
                    isClientPreferredDay &&
                      !isActive &&
                      "ring-1 ring-inset ring-amber-400/70"
                  )}
                >
                  {cell.date.getDate()}
                  {isClientPreferredDay && !isActive && (
                    <span className="absolute top-0.5 size-1 rounded-full bg-amber-500" />
                  )}
                  {summary.isStudioClosure && !isActive && (
                    <span
                      className="absolute bottom-0.5 size-1 rounded-full bg-rose-500"
                      aria-hidden
                    />
                  )}
                  {summary.selectedCount > 0 && !isActive && (
                    <span className="absolute bottom-0.5 size-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day schedule + slot selection */}
        {selectedDate ? (
          <DayScheduleView
            date={selectedDate}
            sessions={sessions}
            hoursPerSession={sessionHours}
            operatingHours={effectiveHours}
            occupiedSlots={occupiedSlots}
            selectedSlots={value}
            clientAvailability={clientAvailability}
            closures={closures}
            readOnly={readOnly}
            onChange={onChange}
            onClose={() => setSelectedDate(null)}
          />
        ) : (
          <div className="flex min-h-[10rem] min-w-0 flex-1 items-center justify-center rounded-lg border border-dashed px-3 text-center text-xs text-muted-foreground">
            {q.selectDateHint}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-lg border p-2.5">
          <p className="text-xs font-medium">
            {formatMessage(q.selectedSlotsCount, { count: value.length })}
          </p>
          <div className="flex flex-col gap-1">
            {value.map((slot) => (
              <div
                key={slot.startTime.toISOString()}
                className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-2 py-1.5 text-xs"
              >
                <span>{formatTimeSlot(slot, dict.dates)}</span>
                {!readOnly && (
                  <button
                    type="button"
                    aria-label={c.removeAria}
                    onClick={() =>
                      onChange(
                        value.filter(
                          (item) =>
                            item.startTime.getTime() !== slot.startTime.getTime()
                        )
                      )
                    }
                    className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
