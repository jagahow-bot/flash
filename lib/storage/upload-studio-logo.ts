/** Studio-admin only (via /api/studio/logo/upload). */
export async function uploadStudioLogo(
  _studioId: string,
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/studio/logo/upload", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as { url?: string; error?: string };

  if (!response.ok || !data.url) {
    throw new Error(data.error ?? "上傳失敗，請稍後再試");
  }

  return data.url;
}
