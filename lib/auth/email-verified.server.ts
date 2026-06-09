import { getAdminAuth } from "@/lib/firebase-admin";

export async function isUserEmailVerified(uid: string): Promise<boolean> {
  try {
    const record = await getAdminAuth().getUser(uid);
    return Boolean(record.emailVerified);
  } catch {
    return false;
  }
}
