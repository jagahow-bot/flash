/** First N successful bookings per studio are free. */
export const FREE_TIER_BOOKINGS = 30;

/** Default launch promo end date (inclusive, YYYY-MM-DD). */
export const LAUNCH_PROMO_END_DATE = "2026-09-30";

/** USD charged per successful booking after free tier (usage-based). */
export const PRICE_PER_BOOKING_USD = 3;

export const BILLING_EXEMPT_ROUTES = ["/billing"] as const;
