import { FieldValue } from "firebase-admin/firestore";
import { normalizeUserEmail } from "@/lib/auth/normalize-user-email";
import { mockArtists } from "@/data/mock/artists";
import { normalizeOperatingHours } from "@/lib/availability/operating-hours";
import {
  normalizeWeeklySchedule,
  weeklyScheduleToOperatingHours,
} from "@/lib/availability/weekly-schedule";
import { COLLECTIONS } from "@/lib/firestore/collections";
import { getAdminDb } from "@/lib/firebase-admin";
import type { Artist } from "@/types/artist";
import type { StudioOperatingHours, StudioWeeklySchedule } from "@/types/operating-hours";

function normalizeArtist(docId: string, data: Record<string, unknown>): Artist {
  const weeklySchedule = data.weeklySchedule
    ? normalizeWeeklySchedule(data.weeklySchedule as StudioWeeklySchedule)
    : data.operatingHours
      ? normalizeWeeklySchedule(data.operatingHours as StudioOperatingHours)
      : undefined;

  return {
    artistId: docId,
    studioId: String(data.studioId ?? ""),
    userEmail:
      typeof data.userEmail === "string"
        ? normalizeUserEmail(data.userEmail)
        : undefined,
    displayName: String(data.displayName ?? ""),
    styles: Array.isArray(data.styles) ? (data.styles as string[]) : [],
    bio: typeof data.bio === "string" ? data.bio : undefined,
    isActive: data.isActive !== false,
    temporaryPassword:
      typeof data.temporaryPassword === "string"
        ? data.temporaryPassword
        : undefined,
    weeklySchedule,
    operatingHours: weeklySchedule
      ? weeklyScheduleToOperatingHours(weeklySchedule)
      : data.operatingHours
        ? normalizeOperatingHours(data.operatingHours as StudioOperatingHours)
        : undefined,
  };
}

export async function getArtistsByStudioId(
  studioId: string
): Promise<Artist[]> {
  const snapshot = await getAdminDb()
    .collection(COLLECTIONS.artists)
    .where("studioId", "==", studioId)
    .get();

  if (!snapshot.empty) {
    return snapshot.docs.map((doc) =>
      normalizeArtist(doc.id, doc.data() as Record<string, unknown>)
    );
  }

  return mockArtists
    .filter((artist) => artist.studioId === studioId)
    .map((artist) => normalizeArtist(artist.artistId, artist as unknown as Record<string, unknown>));
}

export async function getArtistById(
  artistId: string
): Promise<Artist | null> {
  const doc = await getAdminDb()
    .collection(COLLECTIONS.artists)
    .doc(artistId)
    .get();

  if (doc.exists) {
    return normalizeArtist(doc.id, doc.data() as Record<string, unknown>);
  }

  const mockArtist = mockArtists.find((artist) => artist.artistId === artistId);
  if (!mockArtist) return null;

  return normalizeArtist(
    mockArtist.artistId,
    mockArtist as unknown as Record<string, unknown>
  );
}

function stripUndefined(
  record: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined)
  );
}

export async function createArtist(
  artist: Omit<Artist, "artistId">
): Promise<Artist> {
  const ref = getAdminDb().collection(COLLECTIONS.artists).doc();
  const { operatingHours: _omit, ...rest } = artist;
  const payload = stripUndefined(rest as Record<string, unknown>);
  await ref.set(payload);

  return { artistId: ref.id, ...artist };
}

export async function clearArtistTemporaryPasswordByEmail(
  userEmail: string,
  studioId?: string
): Promise<void> {
  const normalized = normalizeUserEmail(userEmail);
  const db = getAdminDb();
  const snapshot = studioId
    ? await db
        .collection(COLLECTIONS.artists)
        .where("studioId", "==", studioId)
        .where("userEmail", "==", normalized)
        .get()
    : await db
        .collection(COLLECTIONS.artists)
        .where("userEmail", "==", normalized)
        .get();

  if (snapshot.empty) {
    return;
  }

  const batch = db.batch();
  for (const doc of snapshot.docs) {
    batch.update(doc.ref, { temporaryPassword: FieldValue.delete() });
  }
  await batch.commit();
}

export async function updateArtistFields(
  artistId: string,
  studioId: string,
  fields: Partial<
    Pick<Artist, "displayName" | "styles" | "bio" | "isActive">
  > & {
    weeklySchedule?: StudioWeeklySchedule | null;
    userEmail?: string | null;
    temporaryPassword?: string | null;
  }
): Promise<void> {
  const ref = getAdminDb().collection(COLLECTIONS.artists).doc(artistId);
  const doc = await ref.get();
  const { weeklySchedule, userEmail, temporaryPassword, ...rest } = fields;
  const payload: Record<string, unknown> = stripUndefined(
    rest as Record<string, unknown>
  );

  if (userEmail === null) {
    payload.userEmail = FieldValue.delete();
    payload.userId = FieldValue.delete();
    payload.temporaryPassword = FieldValue.delete();
  } else if (userEmail !== undefined) {
    payload.userEmail = userEmail;
    payload.userId = FieldValue.delete();
  }

  if (temporaryPassword === null) {
    payload.temporaryPassword = FieldValue.delete();
  } else if (temporaryPassword !== undefined) {
    payload.temporaryPassword = temporaryPassword;
  }

  if (weeklySchedule === null) {
    payload.weeklySchedule = FieldValue.delete();
    payload.operatingHours = FieldValue.delete();
  } else if (weeklySchedule !== undefined) {
    payload.weeklySchedule = weeklySchedule;
    payload.operatingHours = weeklyScheduleToOperatingHours(weeklySchedule);
  }

  if (doc.exists) {
    const data = doc.data() as Artist;
    if (data.studioId !== studioId) {
      throw new Error("Artist does not belong to studio");
    }
    await ref.update(payload);
    return;
  }

  const mockArtist = mockArtists.find((item) => item.artistId === artistId);
  if (!mockArtist || mockArtist.studioId !== studioId) {
    throw new Error("Artist not found");
  }

  await ref.set({
    ...mockArtist,
    ...rest,
    studioId,
    ...(weeklySchedule === null
      ? {}
      : weeklySchedule !== undefined
        ? {
            weeklySchedule,
            operatingHours: weeklyScheduleToOperatingHours(weeklySchedule),
          }
        : {}),
  });
}
