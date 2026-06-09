import { normalizeUserEmail } from "@/lib/auth/normalize-user-email";
import {
  canAccessStudioPortal,
  resolvePrimaryRole,
  getUserRoles,
} from "@/lib/auth/user-roles";
import { COLLECTIONS } from "@/lib/firestore/collections";
import { getAdminDb } from "@/lib/firebase-admin";
import type { Locale } from "@/lib/i18n/config";
import { parsePreferredLocale } from "@/lib/i18n/parse-preferred-locale";
import type { User, UserRole } from "@/types/user";

export class UserAlreadyExistsError extends Error {
  constructor() {
    super("USER_ALREADY_EXISTS");
    this.name = "UserAlreadyExistsError";
  }
}

function userFromDoc(
  uid: string,
  data: Record<string, unknown> | undefined
): User | null {
  if (!data) {
    return null;
  }

  const roles = Array.isArray(data.roles)
    ? ([...new Set(data.roles)] as UserRole[])
    : typeof data.role === "string"
      ? [data.role as UserRole]
      : [];

  if (roles.length === 0) {
    return null;
  }

  return {
    uid,
    email: typeof data.email === "string" ? data.email : "",
    role: resolvePrimaryRole(roles),
    roles,
    studioId: typeof data.studioId === "string" ? data.studioId : undefined,
    preferredLocale: parsePreferredLocale(data.preferredLocale),
  };
}

export async function updateUserPreferredLocale(
  uid: string,
  locale: Locale,
): Promise<void> {
  await getAdminDb()
    .collection(COLLECTIONS.users)
    .doc(uid)
    .set({ preferredLocale: locale }, { merge: true });
}

export async function mergeUserRoles(
  uid: string,
  rolesToAdd: UserRole[]
): Promise<User | null> {
  const ref = getAdminDb().collection(COLLECTIONS.users).doc(uid);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return null;
  }

  const existing = userFromDoc(uid, snapshot.data());
  if (!existing) {
    return null;
  }

  const merged = [...new Set([...getUserRoles(existing), ...rolesToAdd])];
  const role = resolvePrimaryRole(merged);

  await ref.set({ roles: merged, role }, { merge: true });

  return {
    ...existing,
    role,
    roles: merged,
  };
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const normalized = normalizeUserEmail(email);
  const snapshot = await getAdminDb()
    .collection(COLLECTIONS.users)
    .where("email", "==", normalized)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return userFromDoc(doc.id, doc.data());
}

export async function getUserById(uid: string): Promise<User | null> {
  const doc = await getAdminDb().collection(COLLECTIONS.users).doc(uid).get();

  if (!doc.exists) {
    return null;
  }

  return userFromDoc(uid, doc.data());
}

export async function createStudioArtistUser(
  uid: string,
  email: string,
  studioId: string
): Promise<void> {
  const ref = getAdminDb().collection(COLLECTIONS.users).doc(uid);
  const existing = await ref.get();

  if (existing.exists) {
    await mergeUserRoles(uid, ["artist"]);

    const profile = await getUserById(uid);
    if (!profile?.studioId) {
      await linkUserToStudio(uid, studioId);
    }

    return;
  }

  await ref.set({
    email: normalizeUserEmail(email),
    role: "artist",
    roles: ["artist"],
    studioId,
  });
}

export async function createClientUser(
  uid: string,
  email: string
): Promise<void> {
  const ref = getAdminDb().collection(COLLECTIONS.users).doc(uid);
  const existing = await ref.get();

  if (existing.exists) {
    const profile = userFromDoc(uid, existing.data());
    if (profile && getUserRoles(profile).includes("client")) {
      throw new UserAlreadyExistsError();
    }

    await mergeUserRoles(uid, ["client"]);
    return;
  }

  await ref.set({
    email: normalizeUserEmail(email),
    role: "client",
    roles: ["client"],
  });
}

export async function createStudioAdminUser(
  uid: string,
  email: string
): Promise<void> {
  const ref = getAdminDb().collection(COLLECTIONS.users).doc(uid);
  const existing = await ref.get();

  if (existing.exists) {
    await mergeUserRoles(uid, ["admin"]);
    return;
  }

  await ref.set({
    email: normalizeUserEmail(email),
    role: "admin",
    roles: ["admin"],
  });
}

export async function linkUserToStudio(
  uid: string,
  studioId: string
): Promise<void> {
  await getAdminDb()
    .collection(COLLECTIONS.users)
    .doc(uid)
    .set({ studioId }, { merge: true });
}

export async function getStudioPortalUsers(studioId: string): Promise<User[]> {
  const snapshot = await getAdminDb()
    .collection(COLLECTIONS.users)
    .where("studioId", "==", studioId)
    .get();

  const users: User[] = [];

  for (const doc of snapshot.docs) {
    const user = userFromDoc(doc.id, doc.data());
    if (user && canAccessStudioPortal(user)) {
      users.push(user);
    }
  }

  return users;
}
