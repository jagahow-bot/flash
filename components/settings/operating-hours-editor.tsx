"use client";

import { useAppDictionary } from "@/components/providers/locale-provider";
import {
  BUSINESS_HOUR_END,
  BUSINESS_HOUR_START,
  formatScheduleHour,
  toggleDayHour,
} from "@/lib/availability/operating-hours";
import { DAY_ORDER } from "@/lib/availability/slots";
import type { DayOfWeek, StudioOperatingHours } from "@/types/operating-hours";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

const HOUR_OPTIONS = Array.from(
  { length: BUSINESS_HOUR_END - BUSINESS_HOUR_START },
  (_, index) => BUSINESS_HOUR_START + index
);

interface OperatingHoursEditorProps {
  value: StudioOperatingHours;
  onChange: (hours: StudioOperatingHours) => void;
  disabled?: boolean;
}

export function OperatingHoursEditor({
  value,
  onChange,
  disabled = false,
}: OperatingHoursEditorProps) {
  const { settings: s, dates } = useAppDictionary();

  function handleToggle(day: DayOfWeek, hour: number) {
    if (disabled) return;
    onChange(toggleDayHour(value, day, hour));
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        {s.operatingHoursHint}
      </p>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="sticky left-0 z-10 bg-muted/40 px-3 py-2 text-left font-medium text-muted-foreground">
                {s.timeColumn}
              </th>
              {DAY_ORDER.map((day) => (
                <th key={day} className="px-2 py-2 text-center font-medium">
                  {dates.weekdays[day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOUR_OPTIONS.map((hour) => (
              <tr key={hour} className="border-b last:border-b-0">
                <td className="sticky left-0 z-10 bg-background px-3 py-1.5 font-mono text-xs text-muted-foreground">
                  {formatScheduleHour(hour)}
                </td>
                {DAY_ORDER.map((day) => {
                  const checked = value[day]?.includes(hour) ?? false;

                  return (
                    <td key={`${day}-${hour}`} className="px-2 py-1.5 text-center">
                      <Checkbox
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={() => handleToggle(day, hour)}
                        aria-label={`${dates.weekdays[day]} ${formatScheduleHour(hour)}`}
                        className={cn("mx-auto", disabled && "opacity-50")}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
