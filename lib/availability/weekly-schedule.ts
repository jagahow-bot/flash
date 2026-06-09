import { normalizeOperatingHours } from "@/lib/availability/operating-hours";
import { DAY_ORDER } from "@/lib/availability/slots";
import type {
  DayOfWeek,
  StudioOperatingHours,
  StudioWeeklySchedule,
  WeekdaySchedule,
} from "@/types/operating-hours";

/** 24 小時制 HH:mm（00:00–23:59） */
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const RANGE_PATTERN =
  /^([01]?\d|2[0-3]):([0-5]\d)\s*[-–—~至到]\s*([01]?\d|2[0-3]):([0-5]\d)$/;

export const DEFAULT_WEEKDAY: WeekdaySchedule = {
  closed: false,
  start: "09:00",
  end: "21:00",
};

export const DEFAULT_WEEKLY_SCHEDULE: StudioWeeklySchedule = {
  mon: { ...DEFAULT_WEEKDAY },
  tue: { ...DEFAULT_WEEKDAY },
  wed: { ...DEFAULT_WEEKDAY },
  thu: { ...DEFAULT_WEEKDAY },
  fri: { ...DEFAULT_WEEKDAY },
  sat: { ...DEFAULT_WEEKDAY, start: "13:00" },
  sun: { closed: true, start: "09:00", end: "21:00" },
};

export function formatTimeInput(hour: number, minute = 0): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function isValidTimeString(time: string): boolean {
  return TIME_PATTERN.test(time.trim());
}

export function normalizeTimeString(time: string): string | null {
  const trimmed = time.trim();
  if (!isValidTimeString(trimmed)) return null;
  const [hour, minute] = trimmed.split(":");
  return formatTimeInput(Number(hour), Number(minute));
}

export function isValidTimeRange(start: string, end: string): boolean {
  const startHour = parseTimeToHour(start);
  const endHour = parseTimeToHour(end);
  if (startHour === null || endHour === null) return false;
  return startHour < endHour;
}

export function parseTimeToHour(time: string): number | null {
  const normalized = normalizeTimeString(time);
  if (!normalized) return null;
  return Number(normalized.split(":")[0]);
}

export function parseTimeRangeInput(
  input: string
): { start: string; end: string } | null {
  const trimmed = input.trim();
  const match = trimmed.match(RANGE_PATTERN);
  if (!match) return null;

  const start = formatTimeInput(Number(match[1]), Number(match[2]));
  const end = formatTimeInput(Number(match[3]), Number(match[4]));

  if (parseTimeToHour(start) === null || parseTimeToHour(end) === null) {
    return null;
  }

  if (parseTimeToHour(start)! >= parseTimeToHour(end)!) {
    return null;
  }

  return { start, end };
}

export function formatTimeRange(schedule: WeekdaySchedule): string {
  return `${schedule.start}-${schedule.end}`;
}

export function weekdayScheduleToHours(
  schedule: WeekdaySchedule
): number[] {
  if (schedule.closed) return [];

  const startHour = parseTimeToHour(schedule.start);
  const endHour = parseTimeToHour(schedule.end);

  if (startHour === null || endHour === null || startHour >= endHour) {
    return [];
  }

  const hours: number[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    hours.push(hour);
  }

  return hours;
}

export function weeklyScheduleToOperatingHours(
  schedule: StudioWeeklySchedule
): StudioOperatingHours {
  const hours: StudioOperatingHours = {};

  for (const day of DAY_ORDER) {
    const daySchedule = schedule[day];
    if (!daySchedule) continue;

    const dayHours = weekdayScheduleToHours(daySchedule);
    if (dayHours.length > 0) {
      hours[day] = dayHours;
    }
  }

  return hours;
}

export function operatingHoursToWeeklySchedule(
  hours: StudioOperatingHours
): StudioWeeklySchedule {
  const schedule: StudioWeeklySchedule = {};

  for (const day of DAY_ORDER) {
    const dayHours = hours[day];
    if (!dayHours?.length) {
      schedule[day] = { closed: true, start: "09:00", end: "21:00" };
      continue;
    }

    const start = dayHours[0];
    const end = dayHours[dayHours.length - 1] + 1;
    schedule[day] = {
      closed: false,
      start: formatTimeInput(start),
      end: formatTimeInput(end),
    };
  }

  return schedule;
}

export function normalizeWeekdaySchedule(value: unknown): WeekdaySchedule {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_WEEKDAY };
  }

  const record = value as Partial<WeekdaySchedule>;

  if (record.closed === true) {
    return {
      closed: true,
      start: record.start ?? DEFAULT_WEEKDAY.start,
      end: record.end ?? DEFAULT_WEEKDAY.end,
    };
  }

  const rawStart = typeof record.start === "string" ? record.start : "";
  const rawEnd = typeof record.end === "string" ? record.end : "";
  const start =
    normalizeTimeString(rawStart) ?? (rawStart.trim() || DEFAULT_WEEKDAY.start);
  const end =
    normalizeTimeString(rawEnd) ?? (rawEnd.trim() || DEFAULT_WEEKDAY.end);

  return {
    closed: false,
    start,
    end,
  };
}

export function isWeeklyScheduleValid(
  schedule: StudioWeeklySchedule
): boolean {
  const normalized = normalizeWeeklySchedule(schedule);

  for (const day of DAY_ORDER) {
    const daySchedule = normalized[day];
    if (!daySchedule || daySchedule.closed) continue;

    if (
      !isValidTimeString(daySchedule.start) ||
      !isValidTimeString(daySchedule.end) ||
      !isValidTimeRange(daySchedule.start, daySchedule.end)
    ) {
      return false;
    }
  }

  return true;
}

export function normalizeWeeklySchedule(
  input?: StudioWeeklySchedule | StudioOperatingHours | unknown
): StudioWeeklySchedule {
  if (!input || typeof input !== "object") {
    return { ...DEFAULT_WEEKLY_SCHEDULE };
  }

  const record = input as Record<string, unknown>;
  const firstValue = Object.values(record)[0];

  if (Array.isArray(firstValue)) {
    return operatingHoursToWeeklySchedule(input as StudioOperatingHours);
  }

  if (
    typeof firstValue === "string" &&
    (firstValue === "morning" ||
      firstValue === "afternoon" ||
      firstValue === "evening")
  ) {
    return operatingHoursToWeeklySchedule(
      normalizeOperatingHours(input as StudioOperatingHours)
    );
  }

  const schedule: StudioWeeklySchedule = {};

  for (const day of DAY_ORDER) {
    if (record[day]) {
      schedule[day] = normalizeWeekdaySchedule(record[day]);
    }
  }

  return Object.keys(schedule).length > 0
    ? schedule
    : { ...DEFAULT_WEEKLY_SCHEDULE };
}
