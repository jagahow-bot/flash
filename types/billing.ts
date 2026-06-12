export type StudioBillingStatus = "active" | "past_due" | "suspended";

/** Platform-level billing tier (promo / override). Distinct from Stripe `billingStatus`. */
export type PlatformBillingTier = "free" | "paid" | "trial";

/**
 * Monthly successful-booking counter at `studios/{studioId}/billingMonths/{YYYY-MM}`.
 * Periods use UTC calendar months for consistent cross-studio billing queries.
 */
export interface StudioBillingMonth {
  /** Document ID and period key (YYYY-MM, UTC). */
  yearMonth: string;
  /** Successful bookings recorded in this month. */
  count: number;
  updatedAt?: Date;
}

export interface StudioBilling {
  billingStatus: StudioBillingStatus;
  /** Platform promo tier — when `free` or `trial`, usage is not billable. */
  platformBillingTier?: PlatformBillingTier;
  /** Remaining free-tier bookings (starts at 30 for new studios). */
  freeBookingsRemaining: number;
  /** Lifetime count of successful bookings. */
  completedBookingsCount: number;
  /** Launch / per-studio promo end date (YYYY-MM-DD, inclusive). */
  promoFreeUntil?: string;
  /** Additional billing exemption end date (YYYY-MM-DD, inclusive). */
  billingExemptUntil?: string;
  /** Internal notes visible only in platform admin. */
  platformNotes?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  /** ISO month key (YYYY-MM) for the last billed period, when Stripe billing is enabled. */
  lastBilledMonth?: string;
}
