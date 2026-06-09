import { getAuthenticatedUser } from "@/lib/auth/session";
import type { User } from "@/types/user";

export async function requireStudioAdmin(): Promise<{
  user: User;
  studioId: string;
} | null> {
  const user = await getAuthenticatedUser();

  if (!user?.studioId || user.role !== "admin") {
    return null;
  }

  return { user, studioId: user.studioId };
}
