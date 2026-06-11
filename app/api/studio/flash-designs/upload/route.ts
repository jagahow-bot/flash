import { NextRequest, NextResponse } from "next/server";
import { requireStudioAdmin } from "@/lib/auth/require-studio-admin";
import { uploadFlashDesignServer } from "@/lib/storage/upload-flash-design.server";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

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
    const access = await requireStudioAdmin();

    if (!access) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "請上傳認領圖圖片" }, { status: 400 });
    }

    const contentType = imageContentType(file);

    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "僅支援圖片格式" }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "圖片檔案過大" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadFlashDesignServer(
      access.studioId,
      buffer,
      contentType,
      file.name
    );

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Flash design upload failed:", error);
    return NextResponse.json({ error: "上傳失敗，請稍後再試" }, { status: 500 });
  }
}
