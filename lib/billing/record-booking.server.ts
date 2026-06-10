import { FieldValue } from "firebase-admin/firestore";
import { getUtcYearMonth } from "@/lib/billing/billing-months.server";
import { FREE_TIER_BOOKINGS } from "@/lib/billing/constants";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  COLLECTIONS,
  STUDIO_SUBCOLLECTIONS,
} from "@/lib/firestore/collections";

/**
 * Increment successful booking counter when a project first reaches `booked`.
 * Decrements free-tier allowance and records the booking in the current UTC month.
 */
export async function recordSuccessfulBooking(studioId: string): Promise<void> {
  const db = getAdminDb();
  const studioRef = db.collection(COLLECTIONS.studios).doc(studioId);
  const yearMonth = getUtcYearMonth();
  const monthRef = studioRef
    .collection(STUDIO_SUBCOLLECTIONS.billingMonths)
    .doc(yearMonth);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(studioRef);
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

    tx.update(studioRef, {
      completedBookingsCount,
      freeBookingsRemaining,
    });

    tx.set(
      monthRef,
      {
        yearMonth,
        count: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });
}
