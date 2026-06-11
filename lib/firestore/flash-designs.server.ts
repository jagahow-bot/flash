import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS, STUDIO_SUBCOLLECTIONS } from "@/lib/firestore/collections";
import { getAdminDb } from "@/lib/firebase-admin";
import type { FlashDesign } from "@/types/flash-design";

function flashDesignsRef(studioId: string) {
  return getAdminDb()
    .collection(COLLECTIONS.studios)
    .doc(studioId)
    .collection(STUDIO_SUBCOLLECTIONS.flashDesigns);
}

function normalizeFlashDesign(
  docId: string,
  studioId: string,
  data: Record<string, unknown>
): FlashDesign {
  const createdAt = data.createdAt as Timestamp | undefined;
  const updatedAt = data.updatedAt as Timestamp | undefined;

  return {
    designId: docId,
    studioId,
    title: String(data.title ?? ""),
    imageUrl: String(data.imageUrl ?? ""),
    price:
      data.price === null || data.price === undefined
        ? null
        : typeof data.price === "number"
          ? data.price
          : null,
    allowedSizes: Array.isArray(data.allowedSizes)
      ? (data.allowedSizes as string[]).map(String).filter(Boolean)
      : [],
    active: data.active !== false,
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 0,
    createdAt: createdAt?.toDate(),
    updatedAt: updatedAt?.toDate(),
  };
}

export async function getFlashDesignsByStudioId(
  studioId: string,
  options?: { activeOnly?: boolean }
): Promise<FlashDesign[]> {
  const snapshot = await flashDesignsRef(studioId)
    .orderBy("sortOrder", "asc")
    .get();

  let designs = snapshot.docs.map((doc) =>
    normalizeFlashDesign(doc.id, studioId, doc.data() as Record<string, unknown>)
  );

  if (options?.activeOnly) {
    designs = designs.filter((design) => design.active);
  }

  return designs;
}

export async function getFlashDesignById(
  studioId: string,
  designId: string
): Promise<FlashDesign | null> {
  const doc = await flashDesignsRef(studioId).doc(designId).get();
  if (!doc.exists) return null;

  return normalizeFlashDesign(
    doc.id,
    studioId,
    doc.data() as Record<string, unknown>
  );
}

export function resolveFlashDesignPrice(
  design: FlashDesign,
  flashUniformPrice?: number | null
): number | null {
  if (typeof design.price === "number") return design.price;
  if (typeof flashUniformPrice === "number") return flashUniformPrice;
  return null;
}

export async function createFlashDesign(
  studioId: string,
  input: Pick<
    FlashDesign,
    "title" | "imageUrl" | "price" | "allowedSizes" | "active" | "sortOrder"
  >
): Promise<FlashDesign> {
  const ref = flashDesignsRef(studioId).doc();
  const now = FieldValue.serverTimestamp();

  await ref.set({
    studioId,
    title: input.title,
    imageUrl: input.imageUrl,
    price: input.price ?? null,
    allowedSizes: input.allowedSizes,
    active: input.active,
    sortOrder: input.sortOrder,
    createdAt: now,
    updatedAt: now,
  });

  const created = await ref.get();
  return normalizeFlashDesign(
    created.id,
    studioId,
    created.data() as Record<string, unknown>
  );
}

export async function updateFlashDesign(
  studioId: string,
  designId: string,
  updates: Partial<
    Pick<
      FlashDesign,
      "title" | "imageUrl" | "price" | "allowedSizes" | "active" | "sortOrder"
    >
  >
): Promise<void> {
  const ref = flashDesignsRef(studioId).doc(designId);
  const doc = await ref.get();

  if (!doc.exists) {
    throw new Error("FLASH_DESIGN_NOT_FOUND");
  }

  const payload: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.imageUrl !== undefined) payload.imageUrl = updates.imageUrl;
  if (updates.price !== undefined) payload.price = updates.price;
  if (updates.allowedSizes !== undefined) {
    payload.allowedSizes = updates.allowedSizes;
  }
  if (updates.active !== undefined) payload.active = updates.active;
  if (updates.sortOrder !== undefined) payload.sortOrder = updates.sortOrder;

  await ref.update(payload);
}

export async function deleteFlashDesign(
  studioId: string,
  designId: string
): Promise<void> {
  const ref = flashDesignsRef(studioId).doc(designId);
  const doc = await ref.get();

  if (!doc.exists) {
    throw new Error("FLASH_DESIGN_NOT_FOUND");
  }

  await ref.delete();
}
