import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export async function uploadIntakeImage(
  studioId: string,
  file: File,
  folder: "placement" | "references"
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${folder}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const path = `studios/${studioId}/intake/${filename}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  return getDownloadURL(storageRef);
}
