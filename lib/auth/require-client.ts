import { canActAsClient } from "@/lib/auth/user-roles";
import { getAuthenticatedUser } from "@/lib/auth/session";
import type { User } from "@/types/user";

export async function requireClientUser(): Promise<User | null> {
  const user = await getAuthenticatedUser();

  if (!user || !canActAsClient(user)) {
    return null;
  }

  return user;
}
