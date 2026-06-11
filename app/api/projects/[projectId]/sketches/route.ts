import { NextRequest, NextResponse } from "next/server";
import { requireStudioProjectAccess } from "@/lib/auth/require-studio-project";
import { getStudioById } from "@/lib/firestore/studios.server";
import {
  getStudioBookingUrl,
  shouldWatermarkSketches,
} from "@/lib/studio/sketch-watermark";
import { applySketchWatermark } from "@/lib/storage/watermark-image.server";
import { uploadSketchServer } from "@/lib/storage/upload-sketch.server";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const access = await requireStudioProjectAccess(projectId);

    if (!access) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "請上傳設計稿圖片" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "僅支援圖片格式" }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "圖片檔案過大" }, { status: 400 });
    }

    const studio = await getStudioById(access.project.studioId);
    if (!studio) {
      return NextResponse.json({ error: "找不到工作室" }, { status: 404 });
    }

    let buffer = Buffer.from(await file.arrayBuffer());
    let contentType = file.type;

    if (shouldWatermarkSketches(studio)) {
      buffer = Buffer.from(
        await applySketchWatermark(buffer, {
          studioName: studio.name,
          bookingUrl: getStudioBookingUrl(studio.slug),
        })
      );
      if (contentType === "image/gif") {
        contentType = "image/png";
      }
    }

    const url = await uploadSketchServer(
      access.project.studioId,
      projectId,
      buffer,
      contentType,
      file.name
    );

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Sketch upload failed:", error);
    return NextResponse.json({ error: "上傳失敗，請稍後再試" }, { status: 500 });
  }
}
