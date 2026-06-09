import {
  buildSessionSlotFromStart,
  formatHourLabel,
  getOpenHoursForDate,
  getSlotsOnDate,
  hourMatchesClientPreference,
  isSameTimeSlot,
  rangesOverlap,
  sessionMatchesClientPreference,
  validateSessionStart,
} from "@/lib/availability/schedule";
import type { AppDictionary } from "@/lib/i18n/app-types";
import { formatDateKey, formatSlotTimeRange } from "@/lib/project/format";
import type { TimeSlot } from "@/types/session-details";
import type { StudioOperatingHours } from "@/types/operating-hours";
import type { StudioClosure } from "@/types/studio-closure";

export type TimelineHourStatus =
  | "closed"
  | "past"
  | "occupied"
  | "offered"
  | "open";

export interface SessionStartOption {
  startHour: number;
  slot: TimeSlot;
  label: string;
  selected: boolean;
  isClientPreferred: boolean;
}

export interface TimelineHourRow {
  hour: number;
  label: string;
  status: TimelineHourStatus;
  isSessionStart: boolean;
  isClientPreferred: boolean;
}

export function getDayTimelineHours(
  date: Date,
  operatingHours: StudioOperatingHours,
  closures?: StudioClosure[]
): number[] {
  const openHours = getOpenHoursForDate(date, operatingHours, closures);
  if (openHours.length === 0) return [];

  const min = openHours[0];
  const max = openHours[openHours.length - 1];
  const hours: number[] = [];

  for (let hour = min; hour <= max; hour++) {
    hours.push(hour);
  }

  return hours;
}

function getHourSlot(date: Date, hour: number): TimeSlot {
  const startTime = new Date(date);
  startTime.setHours(hour, 0, 0, 0);
  const endTime = new Date(date);
  endTime.setHours(hour + 1, 0, 0, 0);
  return { startTime, endTime };
}

export function getTimelineHourStatus(
  date: Date,
  hour: number,
  operatingHours: StudioOperatingHours,
  occupiedSlots: TimeSlot[],
  selectedSlots: TimeSlot[],
  closures?: StudioClosure[]
): TimelineHourStatus {
  const openHours = getOpenHoursForDate(date, operatingHours, closures);
  if (!openHours.includes(hour)) return "closed";

  const hourSlot = getHourSlot(date, hour);
  if (hourSlot.startTime < new Date()) return "past";

  if (occupiedSlots.some((occupied) => rangesOverlap(hourSlot, occupied))) {
    return "occupied";
  }

  if (
    selectedSlots.some(
      (selected) =>
        formatDateKey(selected.startTime) === formatDateKey(date) &&
        hourSlot.startTime >= selected.startTime &&
        hourSlot.startTime < selected.endTime
    )
  ) {
    return "offered";
  }

  return "open";
}

export function getSessionStartOptions(
  date: Date,
  hoursPerSession: number,
  operatingHours: StudioOperatingHours,
  occupiedSlots: TimeSlot[],
  selectedSlots: TimeSlot[],
  dates: AppDictionary["dates"],
  clientAvailability: string[] = [],
  closures?: StudioClosure[]
): SessionStartOption[] {
  const openHours = getOpenHoursForDate(date, operatingHours, closures);
  const daySelected = getSlotsOnDate(selectedSlots, date);
  const options: SessionStartOption[] = [];

  for (const hour of openHours) {
    const existing = daySelected.find(
      (slot) => slot.startTime.getHours() === hour
    );

    if (existing) {
      options.push({
        startHour: hour,
        slot: existing,
        label: formatSlotTimeRange(existing, dates),
        selected: true,
        isClientPreferred: sessionMatchesClientPreference(
          date,
          hour,
          hoursPerSession,
          clientAvailability
        ),
      });
      continue;
    }

    const error = validateSessionStart(
      date,
      hour,
      hoursPerSession,
      operatingHours,
      occupiedSlots,
      closures
    );

    if (!error) {
      const slot = buildSessionSlotFromStart(date, hour, hoursPerSession);
      options.push({
        startHour: hour,
        slot,
        label: formatSlotTimeRange(slot, dates),
        selected: false,
        isClientPreferred: sessionMatchesClientPreference(
          date,
          hour,
          hoursPerSession,
          clientAvailability
        ),
      });
    }
  }

  return options.sort((a, b) => {
    if (a.isClientPreferred !== b.isClientPreferred) {
      return a.isClientPreferred ? -1 : 1;
    }
    return a.startHour - b.startHour;
  });
}

export function buildTimelineRows(
  date: Date,
  hoursPerSession: number,
  operatingHours: StudioOperatingHours,
  occupiedSlots: TimeSlot[],
  selectedSlots: TimeSlot[],
  dates: AppDictionary["dates"],
  clientAvailability: string[] = [],
  closures?: StudioClosure[]
): TimelineHourRow[] {
  const bookableStarts = new Set(
    getSessionStartOptions(
      date,
      hoursPerSession,
      operatingHours,
      occupiedSlots,
      selectedSlots,
      dates,
      clientAvailability,
      closures
    ).map((option) => option.startHour)
  );

  return getDayTimelineHours(date, operatingHours, closures).map((hour) => ({
    hour,
    label: formatHourLabel(hour),
    status: getTimelineHourStatus(
      date,
      hour,
      operatingHours,
      occupiedSlots,
      selectedSlots,
      closures
    ),
    isSessionStart: bookableStarts.has(hour),
    isClientPreferred: hourMatchesClientPreference(
      date,
      hour,
      clientAvailability
    ),
  }));
}

export function toggleSessionStartOption(
  selectedSlots: TimeSlot[],
  slot: TimeSlot,
  checked: boolean
): TimeSlot[] {
  if (checked) {
    if (selectedSlots.some((item) => isSameTimeSlot(item, slot))) {
      return selectedSlots;
    }
    return [...selectedSlots, slot];
  }

  return selectedSlots.filter((item) => !isSameTimeSlot(item, slot));
}
