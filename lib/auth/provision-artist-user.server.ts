import { randomBytes } from "crypto";
import { normalizeUserEmail } from "@/lib/auth/normalize-user-email";
import { canBindAsStudioArtist } from "@/lib/auth/user-roles";
import {
  ArtistBindError,
} from "@/lib/artists/bind-user-email.server";
import { getArtistsByStudioId } from "@/lib/firestore/artists.server";
import {
  createStudioArtistUser,
  getUserByEmail,
  getUserById,
  linkUserToStudio,
} from "@/lib/firestore/users.server";
import { getAdminAuth } from "@/lib/firebase-admin";

export type ProvisionArtistUserResult = {
  userEmail: string;
  createdAccount: boolean;
  temporaryPassword?: string;
};

function generateTemporaryPassword(): string {
  return randomBytes(9).toString("base64url").slice(0, 12);
}

async function assertArtistEmailAvailable(
  userEmail: string,
  studioId: string,
  excludeArtistId?: string
): Promise<void> {
  const artists = await getArtistsByStudioId(studioId);
  const duplicate = artists.find(
    (artist) =>
      artist.userEmail === userEmail &&
      artist.artistId !== excludeArtistId
  );

  if (duplicate) {
    throw new ArtistBindError(
      "EMAIL_ALREADY_BOUND",
      "此 Email 已綁定其他刺青師"
    );
  }
}

function assertBindableFirestoreUser(
  user: Pick<import("@/types/user").User, "role" | "roles">
): void {
  if (!canBindAsStudioArtist(user)) {
    throw new ArtistBindError(
      "USER_WRONG_ROLE",
      "此 Email 無法綁定為刺青師"
    );
  }
}

async function linkStudioIfUnset(uid: string, studioId: string): Promise<void> {
  const profile = await getUserById(uid);

  if (profile && !profile.studioId) {
    await linkUserToStudio(uid, studioId);
  }
}

/** 確認刺青師帳號存在；若無則自動建立 Firebase Auth + Firestore */
export async function provisionArtistUserEmail(
  input: string | null | undefined,
  studioId: string,
  options?: { excludeArtistId?: string }
): Promise<ProvisionArtistUserResult | undefined> {
  if (input === null || input === undefined) {
    return undefined;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return undefined;
  }

  const userEmail = normalizeUserEmail(trimmed);
  await assertArtistEmailAvailable(
    userEmail,
    studioId,
    options?.excludeArtistId
  );

  const existing = await getUserByEmail(userEmail);

  if (existing) {
    assertBindableFirestoreUser(existing);
    await linkStudioIfUnset(existing.uid, studioId);

    return { userEmail, createdAccount: false };
  }

  const adminAuth = getAdminAuth();
  let authUid: string | null = null;

  try {
    const authUser = await adminAuth.getUserByEmail(userEmail);
    authUid = authUser.uid;
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code !== "auth/user-not-found") {
      throw error;
    }
  }

  if (authUid) {
    const profile = await getUserById(authUid);

    if (profile) {
      assertBindableFirestoreUser(profile);
      await linkStudioIfUnset(authUid, studioId);

      return { userEmail, createdAccount: false };
    }

    await createStudioArtistUser(authUid, userEmail, studioId);
    return { userEmail, createdAccount: false };
  }

  const temporaryPassword = generateTemporaryPassword();
  const created = await adminAuth.createUser({
    email: userEmail,
    password: temporaryPassword,
  });

  await createStudioArtistUser(created.uid, userEmail, studioId);

  return {
    userEmail,
    createdAccount: true,
    temporaryPassword,
  };
}
