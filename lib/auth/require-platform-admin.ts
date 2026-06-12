import { isPlatformAdmin } from "@/lib/auth/platform-admin.server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import type { User } from "@/types/user";

export async function requirePlatformAdmin(): Promise<User | null> {
  const user = await getAuthenticatedUser();
  if (!user || !isPlatformAdmin(user)) {
    return null;
  }
  return user;
}
