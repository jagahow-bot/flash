import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export async function uploadStudioLogo(
  studioId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `logo-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const path = `studios/${studioId}/brand/${filename}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  return getDownloadURL(storageRef);
}
