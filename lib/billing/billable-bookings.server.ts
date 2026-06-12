import { FREE_TIER_BOOKINGS } from "@/lib/billing/constants";
import { isStudioPromoActive } from "@/lib/billing/promo.server";
import type { Studio } from "@/types/studio";

/**
 * Estimate billable successful bookings for a UTC month.
 *
 * `billingMonths/{YYYY-MM}.count` stores all successful bookings in that month.
 * Billable count excludes promo / tier exemptions and remaining lifetime free tier.
 */
export function getMonthlyBillableBookings(
  studio: Pick<
    Studio,
    | "promoFreeUntil"
    | "billingExemptUntil"
    | "createdAt"
    | "platformBillingTier"
    | "freeBookingsRemaining"
  >,
  monthlySuccessfulCount: number
): number {
  if (monthlySuccessfulCount <= 0) return 0;
  if (isStudioPromoActive(studio)) return 0;

  const freeRemaining =
    typeof studio.freeBookingsRemaining === "number"
      ? studio.freeBookingsRemaining
      : FREE_TIER_BOOKINGS;

  return Math.max(0, monthlySuccessfulCount - freeRemaining);
}
