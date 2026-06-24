import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { normalizeUserEmail } from "@/lib/auth/normalize-user-email";
import {
  DEFAULT_WEEKLY_SCHEDULE,
  normalizeWeeklySchedule,
  weeklyScheduleToOperatingHours,
} from "@/lib/availability/weekly-schedule";
import { FREE_TIER_BOOKINGS } from "@/lib/billing/constants";
import { COLLECTIONS } from "@/lib/firestore/collections";
import { getAdminDb } from "@/lib/firebase-admin";
import { getStudioBookingCode } from "@/lib/project/booking-number";
import {
  buildClaimUrl,
  CLAIM_TOKEN_EXPIRY_MS,
  generateClaimToken,
  hashClaimToken,
  isClaimTokenExpired,
} from "@/lib/studio/claim";
import { getProspectStudioDefaults } from "@/lib/studio/prospect-defaults";
import { seedDemoFlashDesignsForStudio } from "@/lib/studio/seed-demo-flash-designs";
import { seedFlashDesignsFromUrls } from "@/lib/studio/seed-flash-designs-from-urls.server";
import { seedDemoProjectsForStudio } from "@/lib/studio/seed-demo-projects";
import {
  fetchRemoteImage,
  isHttpUrl,
} from "@/lib/storage/fetch-remote-image.server";
import { uploadStudioLogoServer } from "@/lib/storage/upload-studio-logo.server";
import { isValidStudioSlug, slugifyStudioName } from "@/lib/studio/slug";
import { parseStudioPreferredLocale } from "@/lib/studio/resolve-studio-locale";
import { quoteCurrencyFromCountry } from "@/lib/currency/quote-currency";
import type { Locale } from "@/lib/i18n/config";
import { defaultLocale } from "@/lib/i18n/config";
import type { Project } from "@/types/project";
import type { Studio } from "@/types/studio";
import { getAppBaseUrl } from "@/lib/email/app-url";
import { isStudioSlugAvailable } from "@/lib/firestore/studios.server";

function addDaysIso(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function stripUndefined(
  record: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined),
  );
}

function parseFirestoreDate(value: unknown): Date | undefined {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  return undefined;
}

export interface CreateProspectStudioInput {
  prospectEmail: string;
  name: string;
  slug?: string;
  bio?: string;
  preferredLocale?: Locale;
  isSoloStudio?: boolean;
  acceptsCoverUp?: boolean;
  artistNames?: string[];
  socialLinks?: Studio["socialLinks"];
  logoUrl?: string;
  flashImageUrls?: string[];
  country?: string;
}

export interface CreateProspectStudioResult {
  studio: Studio;
  claimToken: string;
  claimUrl: string;
  storefrontUrl: string;
  demoProjects: Project[];
}

export async function findStudioByClaimTokenHash(
  tokenHash: string,
): Promise<Studio | null> {
  const snapshot = await getAdminDb()
    .collection(COLLECTIONS.studios)
    .where("claimTokenHash", "==", tokenHash)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return normalizeProspectStudio(doc.id, doc.data() as Record<string, unknown>);
}

export function normalizeProspectStudio(
  docId: string,
  data: Record<string, unknown>,
): Studio {
  const weeklySchedule = normalizeWeeklySchedule(
    data.weeklySchedule ?? data.operatingHours,
  );

  return {
    studioId: docId,
    slug: String(data.slug ?? ""),
    bookingCode: typeof data.bookingCode === "string" ? data.bookingCode : undefined,
    name: String(data.name ?? ""),
    logoUrl:
      typeof data.logoUrl === "string" && data.logoUrl.trim()
        ? data.logoUrl.trim()
        : undefined,
    bio: String(data.bio ?? ""),
    paymentInfo: String(data.paymentInfo ?? ""),
    acceptsCoverUp: data.acceptsCoverUp !== false,
    isSoloStudio: Boolean(data.isSoloStudio),
    artists: Array.isArray(data.artists) ? (data.artists as string[]) : [],
    careGuide: String(data.careGuide ?? ""),
    weeklySchedule,
    closures: [],
    operatingHours: weeklyScheduleToOperatingHours(weeklySchedule),
    preferredLocale: parseStudioPreferredLocale(data.preferredLocale),
    watermarkSketches: data.watermarkSketches !== false,
    billingStatus: "active",
    platformBillingTier:
      data.platformBillingTier === "free" ||
      data.platformBillingTier === "trial" ||
      data.platformBillingTier === "paid"
        ? data.platformBillingTier
        : "trial",
    freeBookingsRemaining:
      typeof data.freeBookingsRemaining === "number"
        ? data.freeBookingsRemaining
        : FREE_TIER_BOOKINGS,
    completedBookingsCount: 0,
    billingExemptUntil:
      typeof data.billingExemptUntil === "string"
        ? data.billingExemptUntil
        : addDaysIso(90),
    lifecycleStatus:
      data.lifecycleStatus === "pending_activation" ||
      data.lifecycleStatus === "active" ||
      data.lifecycleStatus === "suspended"
        ? data.lifecycleStatus
        : "active",
    prospectEmail:
      typeof data.prospectEmail === "string" ? data.prospectEmail : undefined,
    prospectArtistNames: Array.isArray(data.prospectArtistNames)
      ? (data.prospectArtistNames as string[]).filter(Boolean)
      : undefined,
    claimTokenHash:
      typeof data.claimTokenHash === "string" ? data.claimTokenHash : undefined,
    claimTokenExpiresAt: parseFirestoreDate(data.claimTokenExpiresAt),
    createdAt: parseFirestoreDate(data.createdAt),
  };
}

export function isStudioClaimable(studio: Studio): boolean {
  if (studio.lifecycleStatus !== "pending_activation") {
    return false;
  }

  if (!studio.claimTokenHash || !studio.prospectEmail) {
    return false;
  }

  return !isClaimTokenExpired(studio.claimTokenExpiresAt);
}

export async function createProspectStudio(
  input: CreateProspectStudioInput,
): Promise<CreateProspectStudioResult> {
  const email = normalizeUserEmail(input.prospectEmail);
  if (!email) {
    throw new Error("INVALID_EMAIL");
  }

  const locale = input.preferredLocale ?? defaultLocale;
  const slug = (input.slug?.trim().toLowerCase() ||
    slugifyStudioName(input.name)) as string;

  if (!isValidStudioSlug(slug)) {
    throw new Error("INVALID_SLUG");
  }

  if (!(await isStudioSlugAvailable(slug))) {
    throw new Error("SLUG_TAKEN");
  }

  const claimToken = generateClaimToken();
  const claimTokenHash = hashClaimToken(claimToken);
  const claimTokenExpiresAt = new Date(Date.now() + CLAIM_TOKEN_EXPIRY_MS);
  const weeklySchedule = normalizeWeeklySchedule(DEFAULT_WEEKLY_SCHEDULE);
  const ref = getAdminDb().collection(COLLECTIONS.studios).doc();
  const bookingCode = getStudioBookingCode({ slug, bookingCode: undefined });
  const prospectDefaults = getProspectStudioDefaults(locale, input.name.trim());
  const logoUrl =
    (await resolveProspectLogoUrl(ref.id, input.logoUrl)) ??
    prospectDefaults.logoUrl;
  const prospectArtistNames = [
    ...new Set(
      (input.artistNames ?? [])
        .map((name) => name.trim())
        .filter((name) => name.length > 0),
    ),
  ].slice(0, 20);
  const isSoloStudio =
    input.isSoloStudio ??
    (prospectArtistNames.length <= 1 ? true : false);
  const quoteCurrency = quoteCurrencyFromCountry(input.country);

  const studio: Studio = {
    studioId: ref.id,
    slug,
    bookingCode,
    name: input.name.trim(),
    bio: input.bio?.trim() || prospectDefaults.bio,
    logoUrl,
    paymentInfo: prospectDefaults.paymentInfo,
    careGuide: "",
    acceptsCoverUp: input.acceptsCoverUp ?? true,
    isSoloStudio,
    artists: [],
    prospectArtistNames:
      prospectArtistNames.length > 0 ? prospectArtistNames : undefined,
    weeklySchedule,
    closures: [],
    operatingHours: weeklyScheduleToOperatingHours(weeklySchedule),
    preferredLocale: locale,
    ...(quoteCurrency ? { quoteCurrency } : {}),
    watermarkSketches: true,
    flashBookingEnabled: prospectDefaults.flashBookingEnabled,
    flashUniformPrice: prospectDefaults.flashUniformPrice,
    socialLinks: input.socialLinks ?? prospectDefaults.socialLinks,
    billingStatus: "active",
    platformBillingTier: "trial",
    freeBookingsRemaining: FREE_TIER_BOOKINGS,
    completedBookingsCount: 0,
    billingExemptUntil: addDaysIso(90),
    lifecycleStatus: "pending_activation",
    prospectEmail: email,
    claimTokenHash,
    claimTokenExpiresAt,
    createdAt: new Date(),
  };

  const { studioId, operatingHours: _oh, ...payload } = studio;
  void studioId;
  void _oh;

  await ref.set(
    stripUndefined({
      ...(payload as Record<string, unknown>),
      createdAt: Timestamp.fromDate(studio.createdAt ?? new Date()),
      claimTokenExpiresAt: Timestamp.fromDate(claimTokenExpiresAt),
      ...(input.socialLinks ? { socialLinks: input.socialLinks } : {}),
    }),
  );

  const flashImageUrls = input.flashImageUrls
    ?.map((url) => url.trim())
    .filter(Boolean);

  const [demoProjects] = await Promise.all([
    seedDemoProjectsForStudio(studio),
    flashImageUrls?.length
      ? seedFlashDesignsFromUrls(studio, flashImageUrls)
      : seedDemoFlashDesignsForStudio(studio),
  ]);
  const baseUrl = getAppBaseUrl();

  return {
    studio,
    claimToken,
    claimUrl: buildClaimUrl(baseUrl, claimToken),
    storefrontUrl: `${baseUrl.replace(/\/$/, "")}/${studio.slug}`,
    demoProjects,
  };
}

async function resolveProspectLogoUrl(
  studioId: string,
  logoUrl: string | undefined,
): Promise<string | undefined> {
  const trimmed = logoUrl?.trim();
  if (!trimmed) {
    return undefined;
  }

  const fetched = await fetchRemoteImage(trimmed);
  if (fetched) {
    try {
      return await uploadStudioLogoServer(
        studioId,
        fetched.buffer,
        fetched.contentType,
        fetched.originalName,
      );
    } catch {
      // Fall through to external URL when upload fails.
    }
  }

  return isHttpUrl(trimmed) ? trimmed : undefined;
}

export async function clearStudioClaimToken(studioId: string): Promise<void> {
  await getAdminDb()
    .collection(COLLECTIONS.studios)
    .doc(studioId)
    .update({
      claimTokenHash: FieldValue.delete(),
      claimTokenExpiresAt: FieldValue.delete(),
      prospectEmail: FieldValue.delete(),
      lifecycleStatus: "active",
    });
}

export async function verifyClaimToken(
  token: string,
): Promise<{ studio: Studio; email: string } | null> {
  const trimmed = token.trim();
  if (!trimmed) {
    return null;
  }

  const studio = await findStudioByClaimTokenHash(hashClaimToken(trimmed));
  if (!studio || !isStudioClaimable(studio) || !studio.prospectEmail) {
    return null;
  }

  return { studio, email: studio.prospectEmail };
}
