import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/firestore/collections";
import { FREE_TIER_BOOKINGS } from "@/lib/billing/constants";

/**
 * Increment successful booking counter when a project first reaches `booked`.
 * Decrements free-tier allowance; billable bookings are tracked for monthly Stripe invoicing.
 */
export async function recordSuccessfulBooking(studioId: string): Promise<void> {
  const ref = getAdminDb().collection(COLLECTIONS.studios).doc(studioId);
  const db = getAdminDb();

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return;

    const data = snap.data() as Record<string, unknown>;
    const completedBookingsCount =
      (typeof data.completedBookingsCount === "number"
        ? data.completedBookingsCount
        : 0) + 1;
    const currentFree =
      typeof data.freeBookingsRemaining === "number"
        ? data.freeBookingsRemaining
        : FREE_TIER_BOOKINGS;
    const freeBookingsRemaining = Math.max(0, currentFree - 1);

    tx.update(ref, {
      completedBookingsCount,
      freeBookingsRemaining,
    });
  });
}
