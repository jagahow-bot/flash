import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export async function uploadDocumentTemplate(
  studioId: string,
  documentId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "pdf";
  const filename = `template-${Date.now()}.${ext}`;
  const path = `studios/${studioId}/document-templates/${documentId}/${filename}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  return getDownloadURL(storageRef);
}
