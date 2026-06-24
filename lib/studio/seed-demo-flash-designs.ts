import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, STUDIO_SUBCOLLECTIONS } from "@/lib/firestore/collections";
import { DEMO_SEED_ASSETS, demoAssetUrl } from "@/lib/studio/demo-assets";
import type { FlashDesign } from "@/types/flash-design";
import type { Studio } from "@/types/studio";

const DEMO_FLASH_DESIGNS = [
  {
    title: "Fine-line crescent moon",
    imagePath: DEMO_SEED_ASSETS.flash.moon,
    price: null,
    allowedSizes: ["5 × 5 cm", "7 × 7 cm"],
  },
  {
    title: "Geometric snake",
    imagePath: DEMO_SEED_ASSETS.flash.snake,
    price: 220,
    allowedSizes: ["8 × 10 cm"],
  },
  {
    title: "Neo-traditional rose",
    imagePath: DEMO_SEED_ASSETS.flash.rose,
    price: null,
    allowedSizes: ["6 × 8 cm", "10 × 12 cm"],
  },
] as const;

/** Seed published English flash designs for prospect studio storefront preview. */
export async function seedDemoFlashDesignsForStudio(
  studio: Studio,
): Promise<FlashDesign[]> {
  const collection = getAdminDb()
    .collection(COLLECTIONS.studios)
    .doc(studio.studioId)
    .collection(STUDIO_SUBCOLLECTIONS.flashDesigns);

  const designs: FlashDesign[] = [];

  await Promise.all(
    DEMO_FLASH_DESIGNS.map(async (item, index) => {
      const ref = collection.doc();
      const payload = {
        studioId: studio.studioId,
        title: item.title,
        imageUrl: demoAssetUrl(item.imagePath),
        price: item.price,
        allowedSizes: [...item.allowedSizes],
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
    }),
  );

  return designs.sort((a, b) => a.sortOrder - b.sortOrder);
}
