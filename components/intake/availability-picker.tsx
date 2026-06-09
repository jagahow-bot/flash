"use client";

import { useMemo } from "react";
import type { StudioOperatingHours } from "@/types/operating-hours";
import {
  formatAvailabilitySlot,
  formatSlotLabel,
  getOpenDays,
  getOpenPeriods,
  isSlotOpen,
  normalizeAvailabilitySelection,
  slotToKey,
  type AvailabilitySlotLabels,
} from "@/lib/availability/slots";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

interface AvailabilityPickerProps {
  operatingHours: StudioOperatingHours;
  value: string[];
  onChange: (slots: string[]) => void;
  error?: string;
}

export function AvailabilityPicker({
  operatingHours,
  value,
  onChange,
  error,
}: AvailabilityPickerProps) {
  const b = useAppDictionary().booking;
  const slotLabels: AvailabilitySlotLabels = {
    days: b.availabilityDays,
    periods: b.availabilityPeriods,
    separator: b.availabilitySlotSeparator,
  };
  const openDays = getOpenDays(operatingHours);
  const openPeriods = getOpenPeriods(operatingHours);
  const selectedKeys = useMemo(
    () => normalizeAvailabilitySelection(value),
    [value]
  );

  function toggleSlot(slotKey: string) {
    const next = selectedKeys.includes(slotKey)
      ? selectedKeys.filter((slot) => slot !== slotKey)
      : [...selectedKeys, slotKey];
    onChange(next);
  }

  if (openDays.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {b.noBusinessHours}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {b.availabilityExtendedHint}
      </p>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[320px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                {b.availabilityColumnLabel}
              </th>
              {openDays.map((day) => (
                <th
                  key={day}
                  className="px-2 py-2 text-center font-medium"
                >
                  {b.availabilityDays[day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {openPeriods.map((period) => (
              <tr key={period} className="border-b last:border-b-0">
                <td className="px-3 py-2 font-medium text-muted-foreground">
                  {b.availabilityPeriods[period]}
                </td>
                {openDays.map((day) => {
                  const open = isSlotOpen(operatingHours, day, period);

                  if (!open) {
                    return (
                      <td key={`${day}-${period}`} className="px-2 py-2" />
                    );
                  }

                  const slotKey = slotToKey(day, period);
                  const displayLabel = formatSlotLabel(day, period, slotLabels);
                  const selected = selectedKeys.includes(slotKey);

                  return (
                    <td key={`${day}-${period}`} className="px-2 py-2 text-center">
                      <button
                        type="button"
                        aria-pressed={selected}
                        aria-label={displayLabel}
                        onClick={() => toggleSlot(slotKey)}
                        className={cn(
                          "size-9 rounded-full border transition-all",
                          "hover:scale-105 active:scale-95",
                          selected
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-input bg-background hover:border-primary/50 hover:bg-muted"
                        )}
                      >
                        <span className="sr-only">{displayLabel}</span>
                        {selected && (
                          <span aria-hidden className="text-xs font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedKeys.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedKeys.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => toggleSlot(slot)}
              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              {formatAvailabilitySlot(slot, slotLabels)} ×
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
