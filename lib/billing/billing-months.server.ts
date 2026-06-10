import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  COLLECTIONS,
  STUDIO_SUBCOLLECTIONS,
} from "@/lib/firestore/collections";
import type { StudioBillingMonth } from "@/types/billing";

/**
 * UTC calendar month key (YYYY-MM).
 * Billing periods use UTC so month boundaries are consistent for all studios.
 */
export function getUtcYearMonth(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function billingMonthRef(studioId: string, yearMonth: string) {
  return getAdminDb()
    .collection(COLLECTIONS.studios)
    .doc(studioId)
    .collection(STUDIO_SUBCOLLECTIONS.billingMonths)
    .doc(yearMonth);
}

function normalizeBillingMonth(
  data: Record<string, unknown>
): StudioBillingMonth {
  const updatedAt = data.updatedAt as Timestamp | undefined;
  return {
    yearMonth: String(data.yearMonth ?? ""),
    count: typeof data.count === "number" ? Math.max(0, data.count) : 0,
    updatedAt: updatedAt?.toDate(),
  };
}

export async function getStudioBillingMonth(
  studioId: string,
  yearMonth: string
): Promise<StudioBillingMonth | null> {
  const doc = await billingMonthRef(studioId, yearMonth).get();
  if (!doc.exists) return null;
  return normalizeBillingMonth(doc.data() as Record<string, unknown>);
}

export async function getStudioBillingMonthCount(
  studioId: string,
  yearMonth: string
): Promise<number> {
  const month = await getStudioBillingMonth(studioId, yearMonth);
  return month?.count ?? 0;
}

export async function getCurrentMonthBookingCount(studioId: string): Promise<{
  yearMonth: string;
  count: number;
}> {
  const yearMonth = getUtcYearMonth();
  const count = await getStudioBillingMonthCount(studioId, yearMonth);
  return { yearMonth, count };
}
