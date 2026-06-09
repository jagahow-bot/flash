import { cookies } from "next/headers";
import type { User } from "@/types/user";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { normalizeUserRecord } from "@/lib/auth/user-roles";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export async function getAuthenticatedUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!session) {
    return null;
  }

  try {
    const decoded = await getAdminAuth().verifySessionCookie(session, true);
    const userDoc = await getAdminDb().collection("users").doc(decoded.uid).get();

    if (!userDoc.exists) {
      return null;
    }

    return normalizeUserRecord(
      decoded.uid,
      userDoc.data(),
      decoded.email ?? ""
    );
  } catch {
    return null;
  }
}
