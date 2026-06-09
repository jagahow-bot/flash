import { NextRequest, NextResponse } from "next/server";
import { requireClientUser } from "@/lib/auth/require-client";
import { getProjectById } from "@/lib/firestore/projects.server";
import { submitClientDepositProof } from "@/lib/project/client-deposit-submit.server";
import { uploadDepositProofServer } from "@/lib/storage/upload-deposit-proof.server";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const client = await requireClientUser();

    if (!client) {
      return NextResponse.json({ error: "請先登入客戶帳號" }, { status: 401 });
    }

    const { projectId } = await params;
    const formData = await request.formData();
    const file = formData.get("file");
    const studioSlug = formData.get("studioSlug");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "請上傳訂金證明圖片" }, { status: 400 });
    }

    if (typeof studioSlug !== "string" || !studioSlug.trim()) {
      return NextResponse.json({ error: "資料格式不正確" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "僅支援圖片格式" }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "圖片檔案過大" }, { status: 400 });
    }

    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: "找不到此預約" }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const depositProofUrl = await uploadDepositProofServer(
      project.studioId,
      projectId,
      buffer,
      file.type,
      file.name
    );

    const result = await submitClientDepositProof({
      client,
      projectId,
      studioSlug: studioSlug.trim(),
      depositProofUrl,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      projectId,
      status: result.project.status,
      currentSessionIndex: result.project.currentSessionIndex,
    });
  } catch (error) {
    console.error("Deposit proof upload failed:", error);
    return NextResponse.json({ error: "上傳失敗，請稍後再試" }, { status: 500 });
  }
}
