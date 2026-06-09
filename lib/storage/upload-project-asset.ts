import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export type ProjectAssetFolder = "sketches" | "final-photos";

export async function uploadProjectAsset(
  studioId: string,
  projectId: string,
  file: File,
  folder: ProjectAssetFolder
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const path = `studios/${studioId}/projects/${projectId}/${folder}/${filename}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  return getDownloadURL(storageRef);
}
