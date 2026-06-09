import { randomUUID } from "crypto";
import { getAdminStorageBucket } from "@/lib/firebase-admin";

export async function uploadDepositProofServer(
  studioId: string,
  projectId: string,
  buffer: Buffer,
  contentType: string,
  originalName?: string
): Promise<string> {
  const extFromName = originalName?.split(".").pop()?.toLowerCase();
  const ext =
    extFromName && /^[a-z0-9]+$/.test(extFromName)
      ? extFromName
      : contentType === "image/png"
        ? "png"
        : contentType === "image/webp"
          ? "webp"
          : "jpg";
  const filename = `deposit-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  const path = `studios/${studioId}/projects/${projectId}/deposits/${filename}`;
  const bucket = getAdminStorageBucket();
  const file = bucket.file(path);
  const token = randomUUID();

  await file.save(buffer, {
    metadata: {
      contentType,
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  });

  const encodedPath = encodeURIComponent(path);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;
}
