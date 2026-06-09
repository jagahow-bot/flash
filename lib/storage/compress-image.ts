import imageCompression from "browser-image-compression";

const DEFAULT_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("僅支援圖片格式");
  }

  const compressed = await imageCompression(file, DEFAULT_OPTIONS);
  return compressed;
}

export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file)));
}
