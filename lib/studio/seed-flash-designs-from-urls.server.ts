import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, STUDIO_SUBCOLLECTIONS } from "@/lib/firestore/collections";
import { fetchRemoteImage } from "@/lib/storage/fetch-remote-image.server";
import { uploadFlashDesignServer } from "@/lib/storage/upload-flash-design.server";
import type { FlashDesign } from "@/types/flash-design";
import type { Studio } from "@/types/studio";

const MAX_FLASH_IMAGES = 12;

/** Best-effort import of scraped flash images; falls back to external URLs. */
export async function seedFlashDesignsFromUrls(
  studio: Studio,
  imageUrls: string[],
): Promise<FlashDesign[]> {
  const urls = imageUrls
    .map((url) => url.trim())
    .filter(Boolean)
    .slice(0, MAX_FLASH_IMAGES);

  if (urls.length === 0) {
    return [];
  }

  const collection = getAdminDb()
    .collection(COLLECTIONS.studios)
    .doc(studio.studioId)
    .collection(STUDIO_SUBCOLLECTIONS.flashDesigns);

  const designs: FlashDesign[] = [];

  for (let index = 0; index < urls.length; index += 1) {
    const sourceUrl = urls[index];
    let imageUrl = sourceUrl;

    const fetched = await fetchRemoteImage(sourceUrl);
    if (fetched) {
      try {
        imageUrl = await uploadFlashDesignServer(
          studio.studioId,
          fetched.buffer,
          fetched.contentType,
          fetched.originalName,
        );
      } catch {
        // Keep external URL when Storage upload fails.
      }
    }

    const ref = collection.doc();
    const payload = {
      studioId: studio.studioId,
      title: `Flash design ${index + 1}`,
      imageUrl,
      price: null,
      allowedSizes: [] as string[],
      active: true,
      sortOrder: index,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await ref.set(payload);
    designs.push({
      designId: ref.id,
      ...payload,
    });
  }

  return designs;
}
