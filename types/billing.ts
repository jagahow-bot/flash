export type StudioBillingStatus = "active" | "past_due" | "suspended";

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
