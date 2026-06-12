import {
  FREE_TIER_BOOKINGS,
  LAUNCH_PROMO_END_DATE,
} from "@/lib/billing/constants";
import type { PlatformBillingTier } from "@/types/billing";
import type { Studio } from "@/types/studio";

function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  return Number.isNaN(date.getTime()) ? null : date;
}

function endOfIsoDate(value: string): Date | null {
  return parseIsoDate(value);
}

export function normalizePlatformBillingTier(
  value: unknown
): PlatformBillingTier {
  if (value === "free" || value === "trial") return value;
  return "paid";
}

/**
 * Effective promo end date for a studio.
 * Studios without an explicit `promoFreeUntil` inherit the launch promo when
 * created on or before {@link LAUNCH_PROMO_END_DATE}.
 */
export function resolvePromoFreeUntil(
  studio: Pick<Studio, "promoFreeUntil" | "createdAt">
): string | undefined {
  if (studio.promoFreeUntil?.trim()) {
    return studio.promoFreeUntil.trim();
  }

  const launchEnd = parseIsoDate(LAUNCH_PROMO_END_DATE);
  if (!launchEnd) return undefined;

  if (!studio.createdAt) {
    return LAUNCH_PROMO_END_DATE;
  }

  if (studio.createdAt.getTime() <= launchEnd.getTime()) {
    return LAUNCH_PROMO_END_DATE;
  }

  return undefined;
}

export function isDateWithinInclusiveEnd(
  isoDate: string | undefined,
  now = new Date()
): boolean {
  if (!isoDate?.trim()) return false;
  const end = endOfIsoDate(isoDate);
  if (!end) return false;
  return now.getTime() <= end.getTime();
}

export function isStudioPromoActive(
  studio: Pick<
    Studio,
    "promoFreeUntil" | "billingExemptUntil" | "createdAt" | "platformBillingTier"
  >,
  now = new Date()
): boolean {
  const tier = studio.platformBillingTier ?? "paid";
  if (tier === "free" || tier === "trial") {
    return true;
  }

  if (isDateWithinInclusiveEnd(studio.billingExemptUntil, now)) {
    return true;
  }

  const promoUntil = resolvePromoFreeUntil(studio);
  return isDateWithinInclusiveEnd(promoUntil, now);
}

export function shouldConsumeFreeTierBooking(
  studio: Pick<
    Studio,
    | "promoFreeUntil"
    | "billingExemptUntil"
    | "createdAt"
    | "platformBillingTier"
    | "freeBookingsRemaining"
  >
): boolean {
  if (isStudioPromoActive(studio)) {
    return false;
  }

  const remaining =
    typeof studio.freeBookingsRemaining === "number"
      ? studio.freeBookingsRemaining
      : FREE_TIER_BOOKINGS;

  return remaining > 0;
}
