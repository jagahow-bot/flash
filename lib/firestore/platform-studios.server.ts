import { getMonthlyBillableBookings } from "@/lib/billing/billable-bookings.server";
import {
  getCurrentMonthBookingCount,
  listStudioBillingMonths,
} from "@/lib/billing/billing-months.server";
import { resolvePromoFreeUntil, isStudioPromoActive } from "@/lib/billing/promo.server";
import { COLLECTIONS } from "@/lib/firestore/collections";
import {
  findStudioById as findStudioRecordById,
  listAllStudios,
} from "@/lib/firestore/studios.server";
import { getAdminDb } from "@/lib/firebase-admin";
import type { StudioBillingMonth } from "@/types/billing";
import type { Studio } from "@/types/studio";

export interface PlatformStudioBillingMonth extends StudioBillingMonth {
  billableCount: number;
}

export interface PlatformStudioSummary {
  studioId: string;
  name: string;
  slug: string;
  ownerEmail: string | null;
  billingStatus: Studio["billingStatus"];
  platformBillingTier: Studio["platformBillingTier"];
  freeBookingsRemaining: number;
  completedBookingsCount: number;
  promoFreeUntil: string | undefined;
  effectivePromoFreeUntil: string | undefined;
  billingExemptUntil: string | undefined;
  platformNotes: string | undefined;
  promoActive: boolean;
  currentMonth: string;
  monthlySuccessfulCount: number;
  monthlyBillableCount: number;
  billingMonths: PlatformStudioBillingMonth[];
  createdAt?: string;
}

async function getStudioOwnerEmails(
  studioIds: string[]
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (studioIds.length === 0) return result;

  const db = getAdminDb();
  const chunkSize = 10;

  for (let i = 0; i < studioIds.length; i += chunkSize) {
    const chunk = studioIds.slice(i, i + chunkSize);
    const snapshot = await db
      .collection(COLLECTIONS.users)
      .where("studioId", "in", chunk)
      .get();

    for (const doc of snapshot.docs) {
      const data = doc.data() as {
        studioId?: string;
        email?: string;
        role?: string;
        roles?: string[];
      };
      const studioId = data.studioId;
      if (!studioId || result.has(studioId)) continue;

      const roles = Array.isArray(data.roles)
        ? data.roles
        : data.role
          ? [data.role]
          : [];
      if (!roles.includes("admin")) continue;

      if (typeof data.email === "string" && data.email.trim()) {
        result.set(studioId, data.email.trim());
      }
    }
  }

  return result;
}

async function buildPlatformStudioSummary(
  studio: Studio,
  ownerEmail: string | null
): Promise<PlatformStudioSummary> {
  const { yearMonth, count: monthlySuccessfulCount } =
    await getCurrentMonthBookingCount(studio.studioId);
  const billingMonths = await listStudioBillingMonths(studio.studioId, 12);
  const monthsWithBillable: PlatformStudioBillingMonth[] = billingMonths.map(
    (month) => ({
      ...month,
      billableCount: getMonthlyBillableBookings(studio, month.count),
    })
  );

  return {
    studioId: studio.studioId,
    name: studio.name,
    slug: studio.slug,
    ownerEmail,
    billingStatus: studio.billingStatus,
    platformBillingTier: studio.platformBillingTier,
    freeBookingsRemaining: studio.freeBookingsRemaining ?? 0,
    completedBookingsCount: studio.completedBookingsCount ?? 0,
    promoFreeUntil: studio.promoFreeUntil,
    effectivePromoFreeUntil: resolvePromoFreeUntil(studio),
    billingExemptUntil: studio.billingExemptUntil,
    platformNotes: studio.platformNotes,
    promoActive: isStudioPromoActive(studio),
    currentMonth: yearMonth,
    monthlySuccessfulCount,
    monthlyBillableCount: getMonthlyBillableBookings(
      studio,
      monthlySuccessfulCount
    ),
    billingMonths: monthsWithBillable,
    createdAt: studio.createdAt?.toISOString(),
  };
}

/** Same registry as the platform studio list (Firestore + mock fallbacks). */
export async function findStudioById(studioId: string) {
  return findStudioRecordById(studioId);
}

export async function listPlatformStudioSummaries(): Promise<
  PlatformStudioSummary[]
> {
  const studios = await listAllStudios();
  const ownerEmails = await getStudioOwnerEmails(
    studios.map((studio) => studio.studioId)
  );

  const summaries = await Promise.all(
    studios.map((studio) =>
      buildPlatformStudioSummary(
        studio,
        ownerEmails.get(studio.studioId) ?? null
      )
    )
  );

  return summaries;
}

export async function getPlatformStudioSummary(
  studioId: string
): Promise<PlatformStudioSummary | null> {
  const id = studioId.trim();
  if (!id) return null;

  const studios = await listAllStudios();
  const studio = studios.find((item) => item.studioId === id);
  if (!studio) return null;

  const ownerEmails = await getStudioOwnerEmails([id]);
  return buildPlatformStudioSummary(
    studio,
    ownerEmails.get(id) ?? null
  );
}
