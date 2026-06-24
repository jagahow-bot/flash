const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 15_000;

export type FetchedRemoteImage = {
  buffer: Buffer;
  contentType: string;
  originalName?: string;
};

export function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

export async function fetchRemoteImage(
  url: string,
): Promise<FetchedRemoteImage | null> {
  const trimmed = url.trim();
  if (!isHttpUrl(trimmed)) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(trimmed, {
      signal: controller.signal,
      headers: { "User-Agent": "FLASH-Platform-Import/1.0" },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength === 0 || arrayBuffer.byteLength > MAX_IMAGE_BYTES) {
      return null;
    }

    const originalName = trimmed.split("/").pop()?.split("?")[0];
    return {
      buffer: Buffer.from(arrayBuffer),
      contentType,
      originalName,
    };
  } catch {
    return null;
  }
}
