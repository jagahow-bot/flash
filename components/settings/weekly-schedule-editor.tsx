"use client";

import { type KeyboardEvent, useRef, useState } from "react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { DAY_ORDER } from "@/lib/availability/slots";
import {
  DEFAULT_WEEKDAY,
  isValidTimeRange,
  isValidTimeString,
  normalizeTimeString,
} from "@/lib/availability/weekly-schedule";
import type {
  DayOfWeek,
  StudioWeeklySchedule,
  WeekdaySchedule,
} from "@/types/operating-hours";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const EMPTY_DIGITS = ["", "", "", ""] as const;

function digitsToDisplay(digits: readonly string[]): string {
  const [h0, h1, m0, m1] = digits;
  return `${h0 || "·"}${h1 || "·"}:${m0 || "·"}${m1 || "·"}`;
}

function digitsToTime(digits: readonly string[]): string | null {
  if (digits.some((digit) => digit === "")) {
    return null;
  }

  const candidate = `${digits[0]}${digits[1]}:${digits[2]}${digits[3]}`;
  return isValidTimeString(candidate) ? normalizeTimeString(candidate) : null;
}

function TimeInputOverwrite({
  id,
  value,
  onChange,
  disabled,
  invalid,
  placeholder = "09:00",
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
}) {
  const s = useAppDictionary().settings;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [digits, setDigits] = useState<string[]>([...EMPTY_DIGITS]);
  const [digitIndex, setDigitIndex] = useState(0);
  const [lastCommittedValue, setLastCommittedValue] = useState(value);

  if (!isEditing && value !== lastCommittedValue) {
    setLastCommittedValue(value);
    setDigits([...EMPTY_DIGITS]);
    setDigitIndex(0);
  }

  const displayValue = isEditing
    ? digitsToDisplay(digits)
    : isValidTimeString(value)
      ? value
      : value || placeholder;

  function beginEditing() {
    if (disabled) return;
    setIsEditing(true);
    setDigits([...EMPTY_DIGITS]);
    setDigitIndex(0);
    requestAnimationFrame(() => inputRef.current?.select());
  }

  function commitDigits(nextDigits: readonly string[]) {
    const parsed = digitsToTime(nextDigits);
    if (parsed) {
      onChange(parsed);
      setIsEditing(false);
      setDigits([...EMPTY_DIGITS]);
      setDigitIndex(0);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;

    if (event.key >= "0" && event.key <= "9") {
      event.preventDefault();
      if (digitIndex >= 4) return;

      const nextDigits = [...digits];
      nextDigits[digitIndex] = event.key;
      setDigits(nextDigits);
      const nextIndex = digitIndex + 1;
      setDigitIndex(nextIndex);

      if (nextIndex === 4) {
        commitDigits(nextDigits);
      }
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      if (digitIndex > 0) {
        const nextDigits = [...digits];
        nextDigits[digitIndex - 1] = "";
        setDigits(nextDigits);
        setDigitIndex(digitIndex - 1);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsEditing(false);
      setDigits([...EMPTY_DIGITS]);
      setDigitIndex(0);
      inputRef.current?.blur();
    }
  }

  function handleBlur() {
    if (!isEditing) return;

    const parsed = digitsToTime(digits);
    if (parsed) {
      onChange(parsed);
    }

    setIsEditing(false);
    setDigits([...EMPTY_DIGITS]);
    setDigitIndex(0);
  }

  return (
    <Input
      ref={inputRef}
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      disabled={disabled}
      value={displayValue}
      onChange={() => {
        // Overwrite digit entry is handled in onKeyDown.
      }}
      onFocus={beginEditing}
      onClick={beginEditing}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onPaste={(event) => event.preventDefault()}
      className={cn(
        "h-8 w-full px-1.5 text-center font-mono text-xs tabular-nums",
        isEditing && "text-foreground",
        !isEditing && !isValidTimeString(value) && value && "text-destructive"
      )}
      aria-invalid={invalid}
      title={s.timeInputTitle}
    />
  );
}

interface WeeklyScheduleEditorProps {
  value: StudioWeeklySchedule;
  onChange: (value: StudioWeeklySchedule) => void;
  description?: string;
}

function updateDay(
  schedule: StudioWeeklySchedule,
  day: DayOfWeek,
  patch: Partial<WeekdaySchedule>
): StudioWeeklySchedule {
  const current = schedule[day] ?? { ...DEFAULT_WEEKDAY };
  return {
    ...schedule,
    [day]: { ...current, ...patch },
  };
}

export function WeeklyScheduleEditor({
  value,
  onChange,
  description,
}: WeeklyScheduleEditorProps) {
  const s = useAppDictionary().settings;
  const schedule = value;

  return (
    <div className="space-y-3">
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-2 md:grid-cols-7 md:gap-2">
        {DAY_ORDER.map((day) => {
          const daySchedule = schedule[day] ?? { ...DEFAULT_WEEKDAY };
          return (
            <DayColumn
              key={day}
              day={day}
              schedule={daySchedule}
              onChange={(patch) => onChange(updateDay(schedule, day, patch))}
            />
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">{s.timeInputHint}</p>
    </div>
  );
}

function DayColumn({
  day,
  schedule,
  onChange,
}: {
  day: DayOfWeek;
  schedule: WeekdaySchedule;
  onChange: (patch: Partial<WeekdaySchedule>) => void;
}) {
  const { settings: s, dates } = useAppDictionary();
  const startError =
    !schedule.closed && !isValidTimeString(schedule.start);
  const endError =
    !schedule.closed && !isValidTimeString(schedule.end);
  const rangeError =
    !schedule.closed &&
    isValidTimeString(schedule.start) &&
    isValidTimeString(schedule.end) &&
    !isValidTimeRange(schedule.start, schedule.end);
  const hasError = startError || endError || rangeError;

  return (
    <div
      className={cn(
        "flex w-full flex-row items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-2 md:min-w-[4.75rem] md:flex-col md:items-center md:gap-1.5 md:px-2",
        schedule.closed && "bg-muted/40",
        hasError && "border-destructive/40"
      )}
    >
      <span className="w-9 shrink-0 text-xs font-medium md:w-auto md:text-sm">
        {dates.weekdays[day]}
      </span>

      <label className="flex shrink-0 cursor-pointer items-center gap-1 md:justify-center">
        <Checkbox
          checked={schedule.closed}
          onCheckedChange={(checked) => onChange({ closed: checked === true })}
          className="size-3.5"
        />
        <span className="text-[10px] text-muted-foreground sm:text-xs">{s.dayOffShort}</span>
      </label>

      {schedule.closed ? (
        <span className="flex flex-1 items-center justify-end text-[10px] text-muted-foreground md:h-[4.25rem] md:justify-center md:text-xs">
          {s.restDay}
        </span>
      ) : (
        <div className="flex min-w-0 flex-1 flex-row gap-2 md:w-full md:flex-col md:gap-1">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground md:text-center">
              {s.startTime}
            </span>
            <TimeInputOverwrite
              id={`start-${day}`}
              value={schedule.start}
              onChange={(next) => onChange({ start: next })}
              invalid={startError}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground md:text-center">
              {s.endTime}
            </span>
            <TimeInputOverwrite
              id={`end-${day}`}
              value={schedule.end}
              onChange={(next) => onChange({ end: next })}
              invalid={endError || rangeError}
              placeholder="21:00"
            />
          </div>
        </div>
      )}
    </div>
  );
}
