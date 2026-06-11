import { NextRequest, NextResponse } from "next/server";
import { requireClientUser } from "@/lib/auth/require-client";
import { uploadIntakeImageServer } from "@/lib/storage/upload-intake-image.server";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const INTAKE_FOLDERS = new Set(["placement", "references"]);

function imageContentType(file: File): string {
  if (file.type.startsWith("image/")) return file.type;

  const ext = file.name.split(".").pop()?.toLowerCase();
  const byExt: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    jfif: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };

  return (ext && byExt[ext]) ?? "image/jpeg";
}

export async function POST(request: NextRequest) {
  try {
    const client = await requireClientUser();

    if (!client) {
      return NextResponse.json({ error: "請先登入客戶帳號" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const studioId = formData.get("studioId");
    const folder = formData.get("folder");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "請上傳圖片" }, { status: 400 });
    }

    if (typeof studioId !== "string" || !studioId.trim()) {
      return NextResponse.json({ error: "資料格式不正確" }, { status: 400 });
    }

    if (typeof folder !== "string" || !INTAKE_FOLDERS.has(folder)) {
      return NextResponse.json({ error: "資料格式不正確" }, { status: 400 });
    }

    const contentType = imageContentType(file);

    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "僅支援圖片格式" }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "圖片檔案過大" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadIntakeImageServer(
      studioId.trim(),
      buffer,
      contentType,
      folder as "placement" | "references",
      file.name
    );

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Intake image upload failed:", error);
    return NextResponse.json({ error: "上傳失敗，請稍後再試" }, { status: 500 });
  }
}
