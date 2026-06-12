import {
  getStudioBySlug,
} from "@/lib/firestore/studios.server";
import {
  resolveClientAuthStudioSlug,
  type ClientAuthStudioContext,
} from "@/lib/auth/client-auth-url";

export type { ClientAuthStudioContext };

export async function getClientAuthStudioContext(
  redirect?: string,
  studio?: string
): Promise<ClientAuthStudioContext | null> {
  const slug = resolveClientAuthStudioSlug(redirect, studio);
  if (!slug) {
    return null;
  }

  const studioRecord = await getStudioBySlug(slug);
  if (!studioRecord) {
    return null;
  }

  return {
    slug: studioRecord.slug,
    name: studioRecord.name,
    logoUrl: studioRecord.logoUrl,
  };
}
