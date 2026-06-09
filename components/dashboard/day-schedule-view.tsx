"use client";

import { useMemo } from "react";
import { Clock, X } from "lucide-react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { formatMessage } from "@/lib/i18n/format";
import {
  buildTimelineRows,
  getSessionStartOptions,
  toggleSessionStartOption,
} from "@/lib/availability/day-schedule";
import { formatAvailabilitySlot } from "@/lib/availability/slots";
import { getClientPreferredLabelsForDate } from "@/lib/availability/schedule";
import { formatFullDateLabel } from "@/lib/project/format";
import type { TimeSlot } from "@/types/session-details";
import { getClosureForDate } from "@/lib/availability/closures";
import type { StudioOperatingHours } from "@/types/operating-hours";
import type { StudioClosure } from "@/types/studio-closure";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const TIMELINE_BAR: Record<
  ReturnType<typeof buildTimelineRows>[number]["status"],
  string
> = {
  closed: "bg-muted/30",
  past: "bg-muted/40",
  occupied: "bg-destructive/25",
  offered: "bg-primary/30",
  open: "bg-emerald-500/20",
};

interface DayScheduleViewProps {
  date: Date;
  sessions: number;
  hoursPerSession: number;
  operatingHours: StudioOperatingHours;
  occupiedSlots: TimeSlot[];
  selectedSlots: TimeSlot[];
  clientAvailability?: string[];
  closures?: StudioClosure[];
  readOnly?: boolean;
  onChange: (slots: TimeSlot[]) => void;
  onClose: () => void;
}

export function DayScheduleView({
  date,
  sessions,
  hoursPerSession,
  operatingHours,
  occupiedSlots,
  selectedSlots,
  clientAvailability = [],
  closures = [],
  readOnly = false,
  onChange,
  onClose,
}: DayScheduleViewProps) {
  const dict = useAppDictionary();
  const s = dict.schedule;
  const c = dict.common;
  const b = dict.booking;
  const slotLabels = {
    days: b.availabilityDays,
    periods: b.availabilityPeriods,
    separator: b.availabilitySlotSeparator,
  };
  const closure = useMemo(
    () => getClosureForDate(closures, date),
    [closures, date]
  );

  const timelineRows = useMemo(
    () =>
      buildTimelineRows(
        date,
        hoursPerSession,
        operatingHours,
        occupiedSlots,
        selectedSlots,
        dict.dates,
        clientAvailability,
        closures
      ),
    [
      date,
      hoursPerSession,
      operatingHours,
      occupiedSlots,
      selectedSlots,
      dict.dates,
      clientAvailability,
      closures,
    ]
  );

  const startOptions = useMemo(
    () =>
      getSessionStartOptions(
        date,
        hoursPerSession,
        operatingHours,
        occupiedSlots,
        selectedSlots,
        dict.dates,
        clientAvailability,
        closures
      ),
    [
      date,
      hoursPerSession,
      operatingHours,
      occupiedSlots,
      selectedSlots,
      dict.dates,
      clientAvailability,
      closures,
    ]
  );

  const dayPreferredLabels = useMemo(
    () =>
      getClientPreferredLabelsForDate(date, clientAvailability).map((slot) =>
        formatAvailabilitySlot(slot, slotLabels)
      ),
    [
      date,
      clientAvailability,
      b.availabilityDays,
      b.availabilityPeriods,
      b.availabilitySlotSeparator,
    ]
  );

  const daySelectedCount = startOptions.filter((option) => option.selected).length;

  function handleToggle(option: (typeof startOptions)[number], checked: boolean) {
    if (readOnly) return;
    onChange(toggleSessionStartOption(selectedSlots, option.slot, checked));
  }

  return (
    <div className="flex min-h-[10rem] min-w-0 flex-1 flex-col gap-2 rounded-lg border bg-card p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{s.dayScheduleTitle}</p>
          <p className="truncate text-sm font-semibold">
            {formatFullDateLabel(date, dict.dates)}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label={c.closeAria}
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 rounded-md border border-primary/25 bg-primary/5 px-2 py-1 text-[10px]">
          <Clock className="size-3 shrink-0 text-primary" />
          <span>
            {formatMessage(s.sessionHoursSummary, {
              sessions,
              hours: hoursPerSession,
            })}
          </span>
        </div>
        {dayPreferredLabels.length > 0 && (
          <div className="rounded-md border border-amber-300/60 bg-amber-50 px-2 py-1 text-[10px] text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
            {s.clientPreferencePrefix}
            {dayPreferredLabels.join("、")}
          </div>
        )}
      </div>

      {timelineRows.length === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-5 text-center text-xs text-muted-foreground">
          {closure
            ? formatMessage(s.calendarDayClosure, {
                day: date.getDate(),
                label: closure.label ? `：${closure.label}` : "",
              })
            : s.dayOff}
        </p>
      ) : (
        <div className="flex min-h-0 flex-1 flex-row gap-2">
          <div className="flex min-w-0 flex-[3] flex-col gap-1">
            <p className="text-xs font-medium text-muted-foreground">
              {s.scheduleOverview}
            </p>
            <div className="flex flex-col gap-0.5 rounded-lg border bg-muted/20 p-1.5">
              {timelineRows.map((row) => (
                <div key={row.hour} className="flex items-center gap-1.5">
                  <span className="w-9 shrink-0 text-[10px] text-muted-foreground">
                    {row.label}
                  </span>
                  <div
                    className={cn(
                      "relative h-3.5 flex-1 overflow-hidden rounded-sm",
                      row.isClientPreferred && "ring-1 ring-amber-400/80"
                    )}
                  >
                    <div
                      className={cn(
                        "h-full w-full",
                        TIMELINE_BAR[row.status],
                        row.isClientPreferred &&
                          row.status !== "occupied" &&
                          "bg-amber-400/25"
                      )}
                    />
                    {row.isClientPreferred && (
                      <div className="absolute inset-y-0 right-0 w-0.5 bg-amber-500" />
                    )}
                    {row.isSessionStart && row.status !== "occupied" && (
                      <div className="absolute inset-y-0 left-0 w-0.5 bg-emerald-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[9px] text-muted-foreground">
              <span className="inline-flex items-center gap-0.5">
                <span className="size-1.5 rounded-sm bg-emerald-500/20" />{" "}
                {s.slotAvailable}
              </span>
              <span className="inline-flex items-center gap-0.5">
                <span className="size-1.5 rounded-sm bg-primary/30" />{" "}
                {s.slotProposed}
              </span>
              <span className="inline-flex items-center gap-0.5">
                <span className="size-1.5 rounded-sm bg-destructive/25" />{" "}
                {s.slotBooked}
              </span>
              <span className="inline-flex items-center gap-0.5">
                <span className="size-1.5 rounded-sm bg-amber-400/40 ring-1 ring-amber-400/60" />{" "}
                {s.clientPreference}
              </span>
            </div>
          </div>

          <div className="flex min-w-0 flex-[4] flex-col gap-1 border-l pl-2">
            <p className="text-xs font-medium leading-snug">
              {s.selectSlots}
              {startOptions.length > 0 && (
                <span className="font-normal text-muted-foreground">
                  {formatMessage(s.overlappingSlots, {
                    count: startOptions.length,
                  })}
                </span>
              )}
            </p>

            {startOptions.length === 0 ? (
              <p className="flex flex-1 items-center justify-center rounded-md border border-dashed px-2 py-3 text-center text-[10px] text-muted-foreground">
                {formatMessage(s.cannotFitHours, { hours: hoursPerSession })}
              </p>
            ) : (
              <div className="flex max-h-40 flex-col gap-0.5 overflow-y-auto rounded-lg border p-1">
                {startOptions.map((option) => (
                  <label
                    key={option.startHour}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-xs transition-colors hover:bg-muted/50",
                      option.selected && "bg-primary/5",
                      option.isClientPreferred &&
                        "border border-amber-300/50 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/30",
                      readOnly && "cursor-default"
                    )}
                  >
                    <Checkbox
                      checked={option.selected}
                      disabled={readOnly}
                      onCheckedChange={(checked) =>
                        handleToggle(option, checked === true)
                      }
                    />
                    <span className="font-medium tabular-nums">
                      {option.label}
                    </span>
                    {option.isClientPreferred && (
                      <span className="ml-auto shrink-0 rounded-full bg-amber-200 px-1.5 py-0.5 text-[9px] font-medium text-amber-900 dark:bg-amber-900 dark:text-amber-100">
                        {s.preferenceBadge}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}

            {daySelectedCount > 0 && (
              <p className="text-[10px] text-muted-foreground">
                {formatMessage(s.selectedCount, { count: daySelectedCount })}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
