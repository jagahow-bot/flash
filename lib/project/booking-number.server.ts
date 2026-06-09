import { COLLECTIONS } from "@/lib/firestore/collections";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  formatBookingDateKey,
  formatBookingNumber,
  getStudioBookingCode,
} from "@/lib/project/booking-number";
import type { Studio } from "@/types/studio";

/** 配置新預約編號，格式：代碼-日期-流水號（例：MOHEN-20250608-001） */
export async function allocateBookingNumber(studio: Studio): Promise<string> {
  const db = getAdminDb();
  const code = getStudioBookingCode(studio);
  const dateKey = formatBookingDateKey();
  const counterRef = db
    .collection(COLLECTIONS.studios)
    .doc(studio.studioId)
    .collection("counters")
    .doc(`booking-${dateKey}`);

  let bookingNumber = "";

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(counterRef);
    const seq = ((snapshot.data()?.seq as number | undefined) ?? 0) + 1;
    bookingNumber = formatBookingNumber(code, dateKey, seq);
    transaction.set(
      counterRef,
      { seq, dateKey, code, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  });

  return bookingNumber;
}
