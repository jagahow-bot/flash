import type {
  DayOfWeek,
  StudioOperatingHours,
  TimePeriod,
} from "@/types/operating-hours";

const PERIOD_ORDER: TimePeriod[] = ["morning", "afternoon", "evening"];

/** 設定介面與排程日曆可選的小時範圍 */
export const BUSINESS_HOUR_START = 9;
export const BUSINESS_HOUR_END = 22;

export const PERIOD_HOUR_RANGES: Record<
  TimePeriod,
  { startHour: number; endHour: number }
> = {
  morning: { startHour: 9, endHour: 12 },
  afternoon: { startHour: 13, endHour: 17 },
  evening: { startHour: 18, endHour: 22 },
};

const LEGACY_PERIOD_HOURS: Record<TimePeriod, number[]> = {
  morning: [9, 10, 11],
  afternoon: [13, 14, 15, 16],
  evening: [18, 19, 20, 21],
};

const DEFAULT_OPERATING_HOURS: StudioOperatingHours = {
  mon: [10, 11, 12, 13, 14, 15, 16, 17],
  tue: [10, 11, 12, 13, 14, 15, 16, 17],
  wed: [10, 11, 12, 13, 14, 15, 16, 17],
  thu: [10, 11, 12, 13, 14, 15, 16, 17],
  fri: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  sat: [13, 14, 15, 16, 17, 18, 19, 20],
  sun: [13, 14, 15, 16, 17, 18, 19, 20],
};

export function getBusinessHourOptions(): number[] {
  const hours: number[] = [];
  for (let hour = BUSINESS_HOUR_START; hour < BUSINESS_HOUR_END; hour++) {
    hours.push(hour);
  }
  return hours;
}

export function formatScheduleHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

function isTimePeriod(value: string): value is TimePeriod {
  return value === "morning" || value === "afternoon" || value === "evening";
}

export function normalizeDayHours(value: unknown): number[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [];
  }

  if (typeof value[0] === "number") {
    return [...new Set(value as number[])]
      .filter((hour) => Number.isInteger(hour) && hour >= 0 && hour <= 23)
      .sort((a, b) => a - b);
  }

  if (typeof value[0] === "string") {
    const hours = new Set<number>();
    for (const item of value) {
      if (typeof item !== "string" || !isTimePeriod(item)) continue;
      for (const hour of LEGACY_PERIOD_HOURS[item]) {
        hours.add(hour);
      }
    }
    return [...hours].sort((a, b) => a - b);
  }

  return [];
}

export function normalizeOperatingHours(
  hours?: StudioOperatingHours
): StudioOperatingHours {
  if (!hours || Object.keys(hours).length === 0) {
    return { ...DEFAULT_OPERATING_HOURS };
  }

  const normalized: StudioOperatingHours = {};

  for (const [day, value] of Object.entries(hours) as Array<
    [DayOfWeek, unknown]
  >) {
    const dayHours = normalizeDayHours(value);
    if (dayHours.length > 0) {
      normalized[day] = dayHours;
    }
  }

  return Object.keys(normalized).length > 0
    ? normalized
    : { ...DEFAULT_OPERATING_HOURS };
}

export function getDayOpenHours(
  hours: StudioOperatingHours,
  day: DayOfWeek
): number[] {
  return normalizeDayHours(normalizeOperatingHours(hours)[day]);
}

export function isPeriodOpenForDay(
  hours: StudioOperatingHours,
  day: DayOfWeek,
  period: TimePeriod
): boolean {
  const dayHours = getDayOpenHours(hours, day);
  const { startHour, endHour } = PERIOD_HOUR_RANGES[period];
  return dayHours.some((hour) => hour >= startHour && hour < endHour);
}

export function getOpenPeriodsForDay(dayHours: number[]): TimePeriod[] {
  return PERIOD_ORDER.filter((period) => {
    const { startHour, endHour } = PERIOD_HOUR_RANGES[period];
    return dayHours.some((hour) => hour >= startHour && hour < endHour);
  });
}

export function toggleDayHour(
  hours: StudioOperatingHours,
  day: DayOfWeek,
  hour: number
): StudioOperatingHours {
  const normalized = normalizeOperatingHours(hours);
  const current = normalized[day] ?? [];
  const next = current.includes(hour)
    ? current.filter((item) => item !== hour)
    : [...current, hour].sort((a, b) => a - b);

  const result = { ...normalized };

  if (next.length === 0) {
    delete result[day];
  } else {
    result[day] = next;
  }

  return result;
}
