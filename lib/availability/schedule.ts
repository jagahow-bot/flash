import {
  PERIOD_LABELS,
  isSlotOpen,
  normalizeAvailabilitySlot,
  slotToKey,
} from "@/lib/availability/slots";
import { getActiveProjectTimeSlot } from "@/lib/project/active-session-state";
import type { AppDictionary } from "@/lib/i18n/app-types";
import {
  formatDateKey,
  formatFullDateLabel,
  formatMonthDay,
  formatSlotTimeRange,
} from "@/lib/project/format";
import { getConfirmedSessionSlots } from "@/lib/project/session-schedule";

import type { Project } from "@/types/project";
import type { TimeSlot } from "@/types/session-details";
import {
  getDayOpenHours,
  getOpenPeriodsForDay,
  PERIOD_HOUR_RANGES,
} from "@/lib/availability/operating-hours";
import { getClosureForDate, isStudioClosedOnDate } from "@/lib/availability/closures";
import type { DayOfWeek, StudioOperatingHours, TimePeriod } from "@/types/operating-hours";
import type { StudioClosure } from "@/types/studio-closure";

export const PERIOD_HOURS = PERIOD_HOUR_RANGES;

const JS_DAY_TO_DOW: DayOfWeek[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

export type SlotAvailabilityStatus =
  | "closed"
  | "past"
  | "too-short"
  | "occupied"
  | "available"
  | "selected";

export interface CalendarPeriodCell {
  date: Date;
  period: TimePeriod;
  label: string;
  status: SlotAvailabilityStatus;
  slot: TimeSlot | null;
}

export function dateToDayOfWeek(date: Date): DayOfWeek {
  return JS_DAY_TO_DOW[date.getDay()];
}

export function getPeriodDurationHours(period: TimePeriod): number {
  const { startHour, endHour } = PERIOD_HOURS[period];
  return endHour - startHour;
}

export function periodLabelForDate(
  date: Date,
  period: TimePeriod,
  dates: AppDictionary["dates"],
  periodLabels: Record<TimePeriod, string>,
): string {
  return `${formatMonthDay(date, dates, { weekday: true })} ${periodLabels[period]}`;
}

export function buildSessionSlot(
  date: Date,
  period: TimePeriod,
  hoursPerSession: number
): TimeSlot {
  const { startHour } = PERIOD_HOURS[period];
  const startTime = new Date(date);
  startTime.setHours(startHour, 0, 0, 0);

  const endTime = new Date(startTime);
  endTime.setHours(startTime.getHours() + hoursPerSession, 0, 0, 0);

  return { startTime, endTime };
}

export function periodCanFitSession(
  period: TimePeriod,
  hoursPerSession: number
): boolean {
  return hoursPerSession > 0 && getPeriodDurationHours(period) >= hoursPerSession;
}

export function rangesOverlap(a: TimeSlot, b: TimeSlot): boolean {
  return a.startTime < b.endTime && b.startTime < a.endTime;
}

export function isSameTimeSlot(a: TimeSlot, b: TimeSlot): boolean {
  return (
    a.startTime.getTime() === b.startTime.getTime() &&
    a.endTime.getTime() === b.endTime.getTime()
  );
}

export function slotSelectionKey(slot: TimeSlot): string {
  return `${formatDateKey(slot.startTime)}-${slot.startTime.getHours()}-${slot.endTime.getHours()}`;
}

export function getProjectOccupiedSlots(project: Project): TimeSlot[] {
  const slots = [...getConfirmedSessionSlots(project)];
  const activeSlot = getActiveProjectTimeSlot(project);
  if (activeSlot) {
    slots.push(activeSlot);
  }

  const seen = new Set<string>();
  return slots.filter((slot) => {
    const key = `${slot.startTime.getTime()}-${slot.endTime.getTime()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

const SCHEDULE_BLOCKING_STATUSES = new Set<Project["status"]>([
  "pending_payment",
  "deposit_submitted",
  "booked",
]);

/** Whether this project occupies artist calendar time (incl. deposit-pending holds). */
export function projectBlocksScheduleSlot(project: Project): boolean {
  if (!SCHEDULE_BLOCKING_STATUSES.has(project.status)) {
    return false;
  }
  return getProjectOccupiedSlots(project).length > 0;
}

export function getBookedSlotsFromProjects(
  projects: Project[],
  artistId?: string
): TimeSlot[] {
  return projects
    .filter(
      (project) =>
        projectBlocksScheduleSlot(project) &&
        (!artistId || project.artistId === artistId)
    )
    .flatMap((project) => getProjectOccupiedSlots(project));
}

export function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const cells: Array<{ date: Date | null; key: string }> = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push({ date: null, key: `pad-start-${i}` });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    cells.push({ date, key: formatDateKey(date) });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, key: `pad-end-${cells.length}` });
  }

  return cells;
}

function resolvePeriodStatus(
  date: Date,
  period: TimePeriod,
  hoursPerSession: number,
  operatingHours: StudioOperatingHours,
  occupiedSlots: TimeSlot[],
  selectedSlots: TimeSlot[],
  dates: AppDictionary["dates"],
  periodLabels: Record<TimePeriod, string>,
): CalendarPeriodCell {
  const label = periodLabelForDate(date, period, dates, periodLabels);
  const day = dateToDayOfWeek(date);

  if (!isSlotOpen(operatingHours, day, period)) {
    return { date, period, label, status: "closed", slot: null };
  }

  const slot = buildSessionSlot(date, period, hoursPerSession);
  const now = new Date();

  if (slot.startTime < now) {
    return { date, period, label, status: "past", slot };
  }

  if (!periodCanFitSession(period, hoursPerSession)) {
    return { date, period, label, status: "too-short", slot };
  }

  if (occupiedSlots.some((occupied) => rangesOverlap(slot, occupied))) {
    return { date, period, label, status: "occupied", slot };
  }

  if (selectedSlots.some((selected) => isSameTimeSlot(selected, slot))) {
    return { date, period, label, status: "selected", slot };
  }

  return { date, period, label, status: "available", slot };
}

export function getPeriodCellsForDate(
  date: Date,
  hoursPerSession: number,
  operatingHours: StudioOperatingHours,
  occupiedSlots: TimeSlot[],
  selectedSlots: TimeSlot[],
  dates: AppDictionary["dates"],
  periodLabels: Record<TimePeriod, string>,
): CalendarPeriodCell[] {
  const day = dateToDayOfWeek(date);
  const dayHours = getDayOpenHours(operatingHours, day);
  const periods = getOpenPeriodsForDay(dayHours);

  return periods
    .map((period) =>
      resolvePeriodStatus(
        date,
        period,
        hoursPerSession,
        operatingHours,
        occupiedSlots,
        selectedSlots,
        dates,
        periodLabels,
      )
    );
}

export function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

/** 當日營業時間內可排程的小時起點（如 9 → 09:00） */
export function getOpenHoursForDate(
  date: Date,
  operatingHours: StudioOperatingHours,
  closures?: StudioClosure[]
): number[] {
  if (closures && isStudioClosedOnDate(closures, date)) {
    return [];
  }

  return getDayOpenHours(operatingHours, dateToDayOfWeek(date));
}

export function buildSlotFromHourRange(
  date: Date,
  startHour: number,
  endHour: number
): TimeSlot {
  const startTime = new Date(date);
  startTime.setHours(startHour, 0, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(endHour, 0, 0, 0);

  return { startTime, endTime };
}

/** 依 session 開始時間與預估時長建立時段 */
export function buildSessionSlotFromStart(
  date: Date,
  startHour: number,
  hoursPerSession: number
): TimeSlot {
  return buildSlotFromHourRange(date, startHour, startHour + hoursPerSession);
}

export function getSessionDurationHours(slot: TimeSlot): number {
  return (
    (slot.endTime.getTime() - slot.startTime.getTime()) / (1000 * 60 * 60)
  );
}

export function isSlotWithinOpenHours(
  slot: TimeSlot,
  operatingHours: StudioOperatingHours,
  closures?: StudioClosure[]
): boolean {
  const openHours = getOpenHoursForDate(slot.startTime, operatingHours, closures);
  const startHour = slot.startTime.getHours();
  const endHour = slot.endTime.getHours();

  if (endHour <= startHour) return false;

  for (let hour = startHour; hour < endHour; hour++) {
    if (!openHours.includes(hour)) return false;
  }

  return true;
}

export function getSlotsOnDate(slots: TimeSlot[], date: Date): TimeSlot[] {
  const key = formatDateKey(date);
  return slots.filter((slot) => formatDateKey(slot.startTime) === key);
}

export type HourCellStatus =
  | "past"
  | "occupied"
  | "selected"
  | "available"
  | "unavailable";

export function getHourCellStatus(
  date: Date,
  hour: number,
  occupiedSlots: TimeSlot[],
  selectedSlots: TimeSlot[]
): HourCellStatus {
  const hourStart = new Date(date);
  hourStart.setHours(hour, 0, 0, 0);
  const hourEnd = new Date(date);
  hourEnd.setHours(hour + 1, 0, 0, 0);
  const hourSlot: TimeSlot = { startTime: hourStart, endTime: hourEnd };

  if (hourStart < new Date()) return "past";

  if (occupiedSlots.some((occupied) => rangesOverlap(hourSlot, occupied))) {
    return "occupied";
  }

  if (
    selectedSlots.some(
      (selected) =>
        hourStart >= selected.startTime && hourStart < selected.endTime
    )
  ) {
    return "selected";
  }

  return "available";
}

/** 驗證 session 開始時間（僅檢查營業時間與已確認預約，不檢查候選時段之間的重疊） */
export function validateSessionStart(
  date: Date,
  startHour: number,
  hoursPerSession: number,
  operatingHours: StudioOperatingHours,
  occupiedSlots: TimeSlot[],
  closures?: StudioClosure[]
): string | null {
  const slot = buildSessionSlotFromStart(date, startHour, hoursPerSession);

  if (slot.startTime < new Date()) {
    return "不可選擇已過去的時間";
  }

  if (!isSlotWithinOpenHours(slot, operatingHours, closures)) {
    return `此開始時間無法排滿 ${hoursPerSession} 小時，請選擇較早的時段`;
  }

  if (occupiedSlots.some((occupied) => rangesOverlap(slot, occupied))) {
    return "與既有預約衝突";
  }

  return null;
}

export function getSessionStartHourStatus(
  date: Date,
  hour: number,
  hoursPerSession: number,
  operatingHours: StudioOperatingHours,
  occupiedSlots: TimeSlot[],
  selectedSlots: TimeSlot[],
  closures?: StudioClosure[]
): HourCellStatus {
  const hourStart = new Date(date);
  hourStart.setHours(hour, 0, 0, 0);

  if (hourStart < new Date()) return "past";

  if (
    selectedSlots.some(
      (selected) =>
        formatDateKey(selected.startTime) === formatDateKey(date) &&
        selected.startTime.getHours() === hour
    )
  ) {
    return "selected";
  }

  const validationError = validateSessionStart(
    date,
    hour,
    hoursPerSession,
    operatingHours,
    occupiedSlots,
    closures
  );

  if (!validationError) return "available";
  if (validationError === "與既有預約衝突") return "occupied";
  return "unavailable";
}

export function isHourInSessionPreview(
  hour: number,
  startHour: number,
  hoursPerSession: number
): boolean {
  return hour >= startHour && hour < startHour + hoursPerSession;
}

export function filterValidSelectedSlots(
  slots: TimeSlot[],
  hoursPerSession: number,
  operatingHours: StudioOperatingHours,
  occupiedSlots: TimeSlot[],
  closures?: StudioClosure[]
): TimeSlot[] {
  return slots.filter((slot) => {
    if (getSessionDurationHours(slot) !== hoursPerSession) return false;
    if (slot.startTime < new Date()) return false;

    return (
      validateSessionStart(
        slot.startTime,
        slot.startTime.getHours(),
        hoursPerSession,
        operatingHours,
        occupiedSlots,
        closures
      ) === null
    );
  });
}

export function toggleSelectedSlot(
  selected: TimeSlot[],
  slot: TimeSlot
): TimeSlot[] {
  const exists = selected.some((item) => isSameTimeSlot(item, slot));
  if (exists) {
    return selected.filter((item) => !isSameTimeSlot(item, slot));
  }
  return [...selected, slot];
}

function normalizeAvailabilityKeys(slots: string[]): string[] {
  return slots
    .map((slot) => normalizeAvailabilitySlot(slot))
    .filter((slot): slot is string => slot !== null);
}

/** 客戶 intake 的「週六下午」等偏好是否與此日曆格相符 */
export function matchesClientAvailability(
  date: Date,
  period: TimePeriod,
  availabilityLabels: string[]
): boolean {
  const key = slotToKey(dateToDayOfWeek(date), period);
  const normalized = normalizeAvailabilityKeys(availabilityLabels);
  return normalized.includes(key);
}

/** 此日期有哪些客戶偏好時段（如週六 → 週六下午） */
export function getClientPreferredLabelsForDate(
  date: Date,
  availabilityLabels: string[]
): string[] {
  const day = dateToDayOfWeek(date);
  const dayPrefix = `${day}-`;
  return availabilityLabels.filter((slot) => {
    const key = normalizeAvailabilitySlot(slot);
    return key?.startsWith(dayPrefix) ?? false;
  });
}

export function dateHasClientPreference(
  date: Date,
  availabilityLabels: string[]
): boolean {
  return getClientPreferredLabelsForDate(date, availabilityLabels).length > 0;
}

/** 此小時是否落在客戶偏好的時段內 */
export function hourMatchesClientPreference(
  date: Date,
  hour: number,
  availabilityLabels: string[]
): boolean {
  const day = dateToDayOfWeek(date);
  for (const [period, range] of Object.entries(PERIOD_HOURS) as Array<
    [TimePeriod, { startHour: number; endHour: number }]
  >) {
    if (hour >= range.startHour && hour < range.endHour) {
      const key = slotToKey(day, period);
      return normalizeAvailabilityKeys(availabilityLabels).includes(key);
    }
  }
  return false;
}

/** session 是否與客戶偏好時段重疊 */
export function sessionMatchesClientPreference(
  date: Date,
  startHour: number,
  hoursPerSession: number,
  availabilityLabels: string[]
): boolean {
  const endHour = startHour + hoursPerSession;
  for (let hour = startHour; hour < endHour; hour++) {
    if (hourMatchesClientPreference(date, hour, availabilityLabels)) {
      return true;
    }
  }
  return false;
}

export interface DayScheduleSummary {
  date: Date;
  isClosed: boolean;
  isStudioClosure: boolean;
  closureLabel?: string;
  isPast: boolean;
  availableCount: number;
  selectedCount: number;
  occupiedCount: number;
  canOpen: boolean;
}

export function getDayScheduleSummary(
  date: Date,
  _hoursPerSession: number,
  operatingHours: StudioOperatingHours,
  occupiedSlots: TimeSlot[],
  selectedSlots: TimeSlot[],
  closures?: StudioClosure[]
): DayScheduleSummary {
  const closure = closures ? getClosureForDate(closures, date) : null;
  const openHours = getOpenHoursForDate(date, operatingHours, closures);

  if (openHours.length === 0) {
    return {
      date,
      isClosed: true,
      isStudioClosure: Boolean(closure),
      closureLabel: closure?.label,
      isPast: false,
      availableCount: 0,
      selectedCount: 0,
      occupiedCount: 0,
      canOpen: false,
    };
  }

  const hourStatuses = openHours.map((hour) =>
    getSessionStartHourStatus(
      date,
      hour,
      _hoursPerSession,
      operatingHours,
      occupiedSlots,
      selectedSlots,
      closures
    )
  );
  const availableCount = hourStatuses.filter(
    (status) => status === "available"
  ).length;
  const selectedCount = getSlotsOnDate(selectedSlots, date).length;
  const occupiedCount = hourStatuses.filter(
    (status) => status === "occupied"
  ).length;
  const isPast = hourStatuses.every(
    (status) => status === "past" || status === "unavailable"
  );

  return {
    date,
    isClosed: false,
    isStudioClosure: false,
    isPast,
    availableCount,
    selectedCount,
    occupiedCount,
    canOpen:
      !isPast &&
      (availableCount > 0 || selectedCount > 0 || occupiedCount > 0),
  };
}

export function getPeriodStatusLabel(status: SlotAvailabilityStatus): string {
  switch (status) {
    case "available":
      return "可選";
    case "selected":
      return "已選";
    case "occupied":
      return "已有預約";
    case "too-short":
      return "時段不足";
    case "past":
      return "已過期";
    default:
      return "";
  }
}
