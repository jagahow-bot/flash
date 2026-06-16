/** Server-side max per file (API routes). */
export const IMAGE_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

/** Default max images in multi-select intake/reference uploads. */
export const IMAGE_UPLOAD_MAX_COUNT = 6;

/** Client-side compression before upload (`browser-image-compression`). */
export const IMAGE_COMPRESS_MAX_SIZE_MB = 1;
export const IMAGE_COMPRESS_MAX_DIMENSION_PX = 1920;

/** Accepted image MIME types / extensions enforced on API routes. */
export const IMAGE_UPLOAD_FORMATS = ["jpg", "jpeg", "png", "webp", "gif"] as const;
