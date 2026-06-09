import { normalizeUserEmail } from "@/lib/auth/normalize-user-email";
import {
  createArtist,
  getArtistsByStudioId,
  updateArtistFields,
} from "@/lib/firestore/artists.server";
import { syncStudioArtistIds } from "@/lib/firestore/studios.server";

/** 個人工作室：自動建立／綁定唯一刺青師為管理員本人 */
export async function syncSoloStudioArtist(
  studioId: string,
  adminEmail: string,
  displayName: string
): Promise<void> {
  const userEmail = normalizeUserEmail(adminEmail);
  const artists = await getArtistsByStudioId(studioId);
  const linked = artists.find((artist) => artist.userEmail === userEmail);
  const primary = linked ?? artists[0];

  if (primary) {
    await updateArtistFields(primary.artistId, studioId, {
      displayName: displayName.trim() || primary.displayName,
      userEmail,
      isActive: true,
      weeklySchedule: null,
    });

    for (const artist of artists) {
      if (artist.artistId === primary.artistId || !artist.isActive) {
        continue;
      }

      await updateArtistFields(artist.artistId, studioId, { isActive: false });
    }
  } else {
    await createArtist({
      studioId,
      displayName: displayName.trim() || "本人",
      styles: [],
      bio: undefined,
      userEmail,
      isActive: true,
    });
  }

  await syncStudioArtistIds(studioId);
}
