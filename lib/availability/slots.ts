import {
  isPeriodOpenForDay,
  normalizeDayHours,
  normalizeOperatingHours,
} from "@/lib/availability/operating-hours";
import type {
  DayOfWeek,
  StudioOperatingHours,
  TimePeriod,
} from "@/types/operating-hours";

export const DAY_ORDER: DayOfWeek[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

export const PERIOD_ORDER: TimePeriod[] = [
  "morning",
  "afternoon",
  "evening",
];

/** Legacy zh-Hant labels kept for backward compatibility with stored intake data */
export const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: "週一",
  tue: "週二",
  wed: "週三",
  thu: "週四",
  fri: "週五",
  sat: "週六",
  sun: "週日",
};

export const PERIOD_LABELS: Record<TimePeriod, string> = {
  morning: "上午",
  afternoon: "下午",
  evening: "晚上",
};

export interface AvailabilitySlotLabels {
  days: Record<DayOfWeek, string>;
  periods: Record<TimePeriod, string>;
  separator?: string;
}

export interface AvailabilitySlot {
  id: string;
  day: DayOfWeek;
  period: TimePeriod;
  label: string;
}

const SLOT_KEY_PATTERN =
  /^(mon|tue|wed|thu|fri|sat|sun)-(morning|afternoon|evening)$/;

export function slotToKey(day: DayOfWeek, period: TimePeriod): string {
  return `${day}-${period}`;
}

export function parseSlotKey(
  key: string
): { day: DayOfWeek; period: TimePeriod } | null {
  const match = key.match(SLOT_KEY_PATTERN);
  if (!match) return null;
  return {
    day: match[1] as DayOfWeek,
    period: match[2] as TimePeriod,
  };
}

export function formatSlotLabel(
  day: DayOfWeek,
  period: TimePeriod,
  labels?: AvailabilitySlotLabels
): string {
  if (labels) {
    const separator = labels.separator ?? "";
    return `${labels.days[day]}${separator}${labels.periods[period]}`;
  }
  return `${DAY_LABELS[day]}${PERIOD_LABELS[period]}`;
}

export function slotToLabel(day: DayOfWeek, period: TimePeriod): string {
  return formatSlotLabel(day, period);
}

/** Normalize legacy zh-Hant labels or canonical keys to `day-period` keys */
export function normalizeAvailabilitySlot(slot: string): string | null {
  if (parseSlotKey(slot)) return slot;

  for (const day of DAY_ORDER) {
    for (const period of PERIOD_ORDER) {
      if (slot === slotToLabel(day, period)) {
        return slotToKey(day, period);
      }
    }
  }

  return null;
}

export function formatAvailabilitySlot(
  slot: string,
  labels: AvailabilitySlotLabels
): string {
  const key = normalizeAvailabilitySlot(slot);
  if (!key) return slot;

  const parsed = parseSlotKey(key);
  if (!parsed) return slot;

  return formatSlotLabel(parsed.day, parsed.period, labels);
}

export function normalizeAvailabilitySelection(slots: string[]): string[] {
  return slots
    .map((slot) => normalizeAvailabilitySlot(slot))
    .filter((slot): slot is string => slot !== null);
}

export function getEffectiveOperatingHours(
  hours?: StudioOperatingHours
): StudioOperatingHours {
  return normalizeOperatingHours(hours);
}

export function isSlotOpen(
  hours: StudioOperatingHours,
  day: DayOfWeek,
  period: TimePeriod
): boolean {
  return isPeriodOpenForDay(hours, day, period);
}

export function getAvailableSlots(
  hours?: StudioOperatingHours
): AvailabilitySlot[] {
  const effective = getEffectiveOperatingHours(hours);
  const slots: AvailabilitySlot[] = [];

  for (const day of DAY_ORDER) {
    const dayHours = normalizeDayHours(effective[day]);
    if (dayHours.length === 0) continue;

    for (const period of PERIOD_ORDER) {
      if (!isPeriodOpenForDay(effective, day, period)) continue;
      slots.push({
        id: slotToKey(day, period),
        day,
        period,
        label: slotToLabel(day, period),
      });
    }
  }

  return slots;
}

export function getAvailableSlotKeys(hours?: StudioOperatingHours): string[] {
  return getAvailableSlots(hours).map((slot) => slot.id);
}

/** @deprecated Use getAvailableSlotKeys */
export function getAvailableSlotLabels(hours?: StudioOperatingHours): string[] {
  return getAvailableSlots(hours).map((slot) => slot.label);
}

export function getOpenDays(hours?: StudioOperatingHours): DayOfWeek[] {
  const effective = getEffectiveOperatingHours(hours);
  return DAY_ORDER.filter((day) => (normalizeDayHours(effective[day]).length ?? 0) > 0);
}

export function getOpenPeriods(hours?: StudioOperatingHours): TimePeriod[] {
  const effective = getEffectiveOperatingHours(hours);
  return PERIOD_ORDER.filter((period) =>
    DAY_ORDER.some((day) => isPeriodOpenForDay(effective, day, period))
  );
}

export function isValidAvailabilitySelection(
  selected: string[],
  hours?: StudioOperatingHours
): boolean {
  const allowed = new Set(getAvailableSlotKeys(hours));
  return (
    selected.length > 0 &&
    selected.every((slot) => {
      const key = normalizeAvailabilitySlot(slot);
      return key !== null && allowed.has(key);
    })
  );
}
