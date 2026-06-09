import { getAuthenticatedUser } from "@/lib/auth/session";
import type { User } from "@/types/user";

export async function requireOnboardingAdmin(): Promise<User | null> {
  const user = await getAuthenticatedUser();

  if (!user || user.role !== "admin" || user.studioId) {
    return null;
  }

  return user;
}
