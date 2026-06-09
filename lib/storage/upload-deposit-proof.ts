import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export async function uploadDepositProof(
  studioId: string,
  projectId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `deposit-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const path = `studios/${studioId}/projects/${projectId}/deposits/${filename}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  return getDownloadURL(storageRef);
}
