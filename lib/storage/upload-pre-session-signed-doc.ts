import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export async function uploadPreSessionSignedDoc(
  studioId: string,
  projectId: string,
  documentId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "png";
  const filename = `${documentId}-${Date.now()}.${ext}`;
  const path = `studios/${studioId}/projects/${projectId}/pre-session-docs/${filename}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  return getDownloadURL(storageRef);
}

export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mime });
}
