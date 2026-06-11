import imageCompression from "browser-image-compression";

const DEFAULT_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "jfif",
  "png",
  "webp",
  "gif",
  "heic",
  "heif",
  "bmp",
]);

function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext !== undefined && IMAGE_EXTENSIONS.has(ext);
}

export async function compressImage(file: File): Promise<File> {
  if (!isImageFile(file)) {
    throw new Error("僅支援圖片格式");
  }

  const compressed = await imageCompression(file, DEFAULT_OPTIONS);
  return compressed;
}

export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file)));
}
