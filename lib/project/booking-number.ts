import type { Studio } from "@/types/studio";

const BOOKING_CODE_PATTERN = /^[A-Z0-9]{2,12}$/;

/** 從工作室設定或 slug 推導預約編號代碼（例：MOHEN） */
export function getStudioBookingCode(
  studio: Pick<Studio, "slug" | "bookingCode">
): string {
  const custom = studio.bookingCode?.trim().toUpperCase();
  if (custom && BOOKING_CODE_PATTERN.test(custom)) {
    return custom;
  }

  const segment = studio.slug.split("-")[0] ?? studio.slug;
  const derived = segment.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return derived.slice(0, 12) || "STUDIO";
}

/** 台灣時區的 YYYYMMDD */
export function formatBookingDateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";

  return `${year}${month}${day}`;
}

export function formatBookingNumber(
  code: string,
  dateKey: string,
  sequence: number
): string {
  return `${code}-${dateKey}-${String(sequence).padStart(3, "0")}`;
}

export function normalizeBookingCode(input?: unknown): string | undefined {
  if (typeof input !== "string") return undefined;

  const normalized = input.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!normalized || !BOOKING_CODE_PATTERN.test(normalized)) {
    return undefined;
  }

  return normalized;
}
