export type StudioBillingStatus = "active" | "past_due" | "suspended";

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
  /** Remaining free-tier bookings (starts at 30 for new studios). */
  freeBookingsRemaining: number;
  /** Lifetime count of successful bookings. */
  completedBookingsCount: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  /** ISO month key (YYYY-MM) for the last billed period, when Stripe billing is enabled. */
  lastBilledMonth?: string;
}
