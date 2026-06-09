import type { AppDictionary } from "@/lib/i18n/app-types";
import { formatMessage } from "@/lib/i18n/format";
import type { TimeSlot } from "@/types/session-details";
import type { DayOfWeek } from "@/types/operating-hours";

const JS_DAY_TO_DOW: DayOfWeek[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

function weekdayLabel(date: Date, dates: AppDictionary["dates"]): string {
  return dates.weekdays[JS_DAY_TO_DOW[date.getDay()]];
}

/** 固定格式，避免 SSR / 瀏覽器 toLocaleString 不一致造成 hydration 錯誤 */
export function formatTime(date: Date): string {
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

export function formatMonthDay(
  date: Date,
  dates: AppDictionary["dates"],
  options?: { weekday?: boolean },
): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const base = formatMessage(dates.monthDay, { month, day });
  if (options?.weekday) {
    return formatMessage(dates.monthDayWeekday, {
      base,
      weekday: weekdayLabel(date, dates),
    });
  }
  return base;
}

export function formatYearMonth(
  date: Date,
  dates: AppDictionary["dates"],
): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return formatMessage(dates.yearMonth, { year, month });
}

export function formatFullDateLabel(
  date: Date,
  dates: AppDictionary["dates"],
): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return formatMessage(dates.fullDate, {
    year,
    month,
    day,
    weekday: weekdayLabel(date, dates),
  });
}

export function formatDepositDeadline(
  date: Date,
  dates: AppDictionary["dates"],
): string {
  return formatMessage(dates.dateAtTime, {
    date: formatFullDateLabel(date, dates),
    time: formatTime(date),
  });
}

export function formatPrice(
  value: number | string,
  common: Pick<AppDictionary["common"], "priceFormat">,
): string {
  if (typeof value === "string") {
    return value;
  }
  const amount = value.toLocaleString("en-US");
  return formatMessage(common.priceFormat, { amount });
}

export function formatTimeSlot(
  slot: TimeSlot,
  dates: AppDictionary["dates"],
): string {
  return `${formatMonthDay(slot.startTime, dates, { weekday: true })} ${formatTimeRange(slot, dates)}`;
}

export function formatSlotTimeRange(
  slot: TimeSlot,
  dates: AppDictionary["dates"],
): string {
  return formatTimeRange(slot, dates);
}

function formatTimeRange(
  slot: TimeSlot,
  dates: AppDictionary["dates"],
): string {
  return formatMessage(dates.timeRange, {
    start: formatTime(slot.startTime),
    end: formatTime(slot.endTime),
  });
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** @deprecated Use formatTime */
export const formatTaiwanTime = formatTime;

/** @deprecated Use formatMonthDay */
export const formatTaiwanMonthDay = formatMonthDay;

/** @deprecated Use formatYearMonth */
export const formatTaiwanYearMonth = formatYearMonth;
