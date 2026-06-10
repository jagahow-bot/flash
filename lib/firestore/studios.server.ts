import { FieldValue } from "firebase-admin/firestore";
import {
  getMockStudioById,
  getMockStudioBySlug,
  mockStudios,
} from "@/data/mock/index";
import { normalizeClosures } from "@/lib/availability/closures";
import {
  getStudioBookingCode,
  normalizeBookingCode,
} from "@/lib/project/booking-number";
import { normalizeOperatingHours } from "@/lib/availability/operating-hours";
import {
  normalizeWeeklySchedule,
  weeklyScheduleToOperatingHours,
} from "@/lib/availability/weekly-schedule";
import { COLLECTIONS } from "@/lib/firestore/collections";
import { getAdminDb } from "@/lib/firebase-admin";
import { parseStudioPreferredLocale } from "@/lib/studio/resolve-studio-locale";
import { normalizeStudioSocialLinks } from "@/lib/studio/social-links";
import type { PreSessionDocumentTemplate } from "@/types/pre-session-document";
import { defaultLocale } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";
import { FREE_TIER_BOOKINGS } from "@/lib/billing/constants";
import type { StudioBillingStatus } from "@/types/billing";
import type { Studio, StudioSocialLinks } from "@/types/studio";
import { Timestamp } from "firebase-admin/firestore";

function normalizeBillingStatus(value: unknown): StudioBillingStatus {
  if (value === "past_due" || value === "suspended") return value;
  return "active";
}

function stripUndefined(
  record: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined)
  );
}

function deserializePreSessionDocumentTemplate(
  raw: Record<string, unknown>
): PreSessionDocumentTemplate {
  const createdAt = raw.createdAt as Timestamp | undefined;
  return {
    documentId: String(raw.documentId ?? ""),
    title: String(raw.title ?? ""),
    description:
      typeof raw.description === "string" ? raw.description : undefined,
    templateFileUrl: String(raw.templateFileUrl ?? ""),
    signatureMode:
      raw.signatureMode === "online_advance" ? "online_advance" : "in_person",
    isRequired: Boolean(raw.isRequired),
    sortOrder: Number(raw.sortOrder ?? 0),
    createdAt: createdAt?.toDate(),
  };
}

function normalizePreSessionDocuments(
  data: Record<string, unknown>
): PreSessionDocumentTemplate[] | undefined {
  if (!Array.isArray(data.preSessionDocuments)) {
    return undefined;
  }

  return (data.preSessionDocuments as Record<string, unknown>[])
    .map(deserializePreSessionDocumentTemplate)
    .filter((doc) => doc.documentId && doc.title && doc.templateFileUrl)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function normalizeStudio(docId: string, data: Record<string, unknown>): Studio {
  const weeklySchedule = normalizeWeeklySchedule(
    data.weeklySchedule ?? data.operatingHours
  );
  const closures = normalizeClosures(data.closures);

  return {
    studioId: docId,
    slug: String(data.slug ?? ""),
    bookingCode: normalizeBookingCode(data.bookingCode),
    name: String(data.name ?? ""),
    logoUrl:
      typeof data.logoUrl === "string" && data.logoUrl.trim()
        ? data.logoUrl.trim()
        : undefined,
    bio: String(data.bio ?? ""),
    paymentInfo: String(data.paymentInfo ?? ""),
    depositDeadlineDays:
      typeof data.depositDeadlineDays === "number" && data.depositDeadlineDays >= 1
        ? Math.min(data.depositDeadlineDays, 30)
        : undefined,
    acceptsCoverUp: Boolean(data.acceptsCoverUp),
    isSoloStudio: Boolean(data.isSoloStudio),
    artists: Array.isArray(data.artists) ? (data.artists as string[]) : [],
    careGuide: String(data.careGuide ?? ""),
    weeklySchedule,
    closures,
    operatingHours: weeklyScheduleToOperatingHours(weeklySchedule),
    preSessionDocuments: normalizePreSessionDocuments(data),
    socialLinks: normalizeStudioSocialLinks(
      data.socialLinks as StudioSocialLinks | undefined
    ),
    preferredLocale: parseStudioPreferredLocale(data.preferredLocale),
    billingStatus: normalizeBillingStatus(data.billingStatus),
    freeBookingsRemaining:
      typeof data.freeBookingsRemaining === "number"
        ? Math.max(0, data.freeBookingsRemaining)
        : FREE_TIER_BOOKINGS,
    completedBookingsCount:
      typeof data.completedBookingsCount === "number"
        ? Math.max(0, data.completedBookingsCount)
        : 0,
    stripeCustomerId:
      typeof data.stripeCustomerId === "string"
        ? data.stripeCustomerId
        : undefined,
    stripeSubscriptionId:
      typeof data.stripeSubscriptionId === "string"
        ? data.stripeSubscriptionId
        : undefined,
    lastBilledMonth:
      typeof data.lastBilledMonth === "string"
        ? data.lastBilledMonth
        : undefined,
  };
}

function normalizeMockStudio(studio: Studio): Studio {
  const weeklySchedule = normalizeWeeklySchedule(
    studio.weeklySchedule ?? studio.operatingHours
  );

  return {
    ...studio,
    weeklySchedule,
    closures: normalizeClosures(studio.closures),
    operatingHours: weeklyScheduleToOperatingHours(weeklySchedule),
  };
}

export async function getStudioById(studioId: string): Promise<Studio | null> {
  const doc = await getAdminDb()
    .collection(COLLECTIONS.studios)
    .doc(studioId)
    .get();

  if (doc.exists) {
    return normalizeStudio(doc.id, doc.data() as Record<string, unknown>);
  }

  const mockStudio = getMockStudioById(studioId);
  if (!mockStudio) return null;

  return normalizeMockStudio({
    ...mockStudio,
    operatingHours: normalizeOperatingHours(mockStudio.operatingHours),
  });
}

export async function isStudioSlugAvailable(slug: string): Promise<boolean> {
  const snapshot = await getAdminDb()
    .collection(COLLECTIONS.studios)
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    return false;
  }

  const mock = getMockStudioBySlug(slug);
  return !mock;
}

export async function createStudio(
  input: Pick<
    Studio,
    | "slug"
    | "name"
    | "bio"
    | "paymentInfo"
    | "careGuide"
    | "acceptsCoverUp"
    | "weeklySchedule"
  > & {
    bookingCode?: string;
    isSoloStudio?: boolean;
    preferredLocale?: Locale;
  }
): Promise<Studio> {
  const ref = getAdminDb().collection(COLLECTIONS.studios).doc();
  const weeklySchedule = normalizeWeeklySchedule(input.weeklySchedule);
  const bookingCode =
    normalizeBookingCode(input.bookingCode) ??
    getStudioBookingCode({ slug: input.slug, bookingCode: undefined });
  const studio: Studio = {
    studioId: ref.id,
    slug: input.slug,
    bookingCode,
    name: input.name,
    bio: input.bio,
    paymentInfo: input.paymentInfo,
    careGuide: input.careGuide ?? "",
    acceptsCoverUp: input.acceptsCoverUp,
    isSoloStudio: Boolean(input.isSoloStudio),
    artists: [],
    weeklySchedule,
    closures: [],
    operatingHours: weeklyScheduleToOperatingHours(weeklySchedule),
    preferredLocale: input.preferredLocale ?? defaultLocale,
    billingStatus: "active",
    freeBookingsRemaining: FREE_TIER_BOOKINGS,
    completedBookingsCount: 0,
  };

  const { studioId: _omit, operatingHours, logoUrl: _logo, ...payload } = studio;
  await ref.set(stripUndefined(payload as Record<string, unknown>));

  return studio;
}

export async function listPublicStudioSlugs(): Promise<string[]> {
  const slugs = new Set(mockStudios.map((studio) => studio.slug));

  try {
    const snapshot = await getAdminDb().collection(COLLECTIONS.studios).get();
    for (const doc of snapshot.docs) {
      const slug = String((doc.data() as { slug?: string }).slug ?? "");
      if (slug) slugs.add(slug);
    }
  } catch (error) {
    console.error("Failed to fetch studio slugs for sitemap:", error);
  }

  return [...slugs];
}

export async function getStudioBySlug(slug: string): Promise<Studio | null> {
  const snapshot = await getAdminDb()
    .collection(COLLECTIONS.studios)
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return normalizeStudio(doc.id, doc.data() as Record<string, unknown>);
  }

  const mock = getMockStudioBySlug(slug);
  if (!mock) return null;

  return normalizeMockStudio({
    ...mock,
    operatingHours: normalizeOperatingHours(mock.operatingHours),
  });
}

export async function updateStudioFields(
  studioId: string,
  fields: Partial<
    Pick<
      Studio,
      | "name"
      | "bio"
      | "paymentInfo"
      | "depositDeadlineDays"
      | "careGuide"
      | "acceptsCoverUp"
      | "isSoloStudio"
      | "weeklySchedule"
      | "closures"
      | "operatingHours"
      | "artists"
      | "preSessionDocuments"
      | "preferredLocale"
      | "billingStatus"
      | "freeBookingsRemaining"
      | "completedBookingsCount"
      | "stripeCustomerId"
      | "stripeSubscriptionId"
      | "lastBilledMonth"
    >
  > & {
    logoUrl?: string | null;
    bookingCode?: string | null;
    socialLinks?: StudioSocialLinks | null;
  }
): Promise<void> {
  const ref = getAdminDb().collection(COLLECTIONS.studios).doc(studioId);
  const doc = await ref.get();
  const { logoUrl, bookingCode, socialLinks, ...rest } = fields;
  const payload: Record<string, unknown> = { ...rest };

  if (logoUrl === null) {
    payload.logoUrl = FieldValue.delete();
  } else if (logoUrl !== undefined) {
    payload.logoUrl = logoUrl;
  }

  if (bookingCode === null) {
    payload.bookingCode = FieldValue.delete();
  } else if (bookingCode !== undefined) {
    payload.bookingCode = bookingCode;
  }

  if (socialLinks === null) {
    payload.socialLinks = FieldValue.delete();
  } else if (socialLinks !== undefined) {
    payload.socialLinks = socialLinks;
  }

  const cleanedPayload = stripUndefined(payload);

  if (doc.exists) {
    await ref.update(cleanedPayload);
    return;
  }

  const mockStudio = getMockStudioById(studioId);
  if (!mockStudio) {
    throw new Error("Studio not found");
  }

  await ref.set(
    stripUndefined({
      ...mockStudio,
      ...rest,
      ...(logoUrl === null || logoUrl === undefined ? {} : { logoUrl }),
      ...(bookingCode === null || bookingCode === undefined
        ? {}
        : { bookingCode }),
      ...(socialLinks === null || socialLinks === undefined
        ? {}
        : { socialLinks }),
    })
  );
}

export async function syncStudioArtistIds(studioId: string): Promise<void> {
  const snapshot = await getAdminDb()
    .collection(COLLECTIONS.artists)
    .where("studioId", "==", studioId)
    .get();

  const artistIds = snapshot.docs
    .filter((doc) => (doc.data() as { isActive?: boolean }).isActive !== false)
    .map((doc) => doc.id);
  await updateStudioFields(studioId, { artists: artistIds });
}
