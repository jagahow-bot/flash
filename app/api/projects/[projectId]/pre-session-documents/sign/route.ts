import { NextRequest, NextResponse } from "next/server";
import { requireClientUser } from "@/lib/auth/require-client";
import { getProjectById } from "@/lib/firestore/projects.server";
import { submitClientPreSessionSignature } from "@/lib/project/client-pre-session-sign.server";
import { parsePreSessionSignerInfo } from "@/lib/validations/pre-session-signer";
import { uploadPreSessionSignedDocServer } from "@/lib/storage/upload-pre-session-signed-doc.server";

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
    const documentId = formData.get("documentId");
    const clientSignatureDataUrl = formData.get("clientSignatureDataUrl");
    const signerInfoRaw = formData.get("signerInfo");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "請提供簽名圖片" }, { status: 400 });
    }

    if (typeof studioSlug !== "string" || !studioSlug.trim()) {
      return NextResponse.json({ error: "資料格式不正確" }, { status: 400 });
    }

    if (typeof documentId !== "string" || !documentId.trim()) {
      return NextResponse.json({ error: "資料格式不正確" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "僅支援圖片格式" }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "圖片檔案過大" }, { status: 400 });
    }

    let signerInfo: ReturnType<typeof parsePreSessionSignerInfo> = null;
    if (typeof signerInfoRaw === "string" && signerInfoRaw.trim()) {
      try {
        signerInfo = parsePreSessionSignerInfo(JSON.parse(signerInfoRaw));
      } catch {
        return NextResponse.json({ error: "簽署人資料格式不正確" }, { status: 400 });
      }
    }

    if (!signerInfo) {
      return NextResponse.json({ error: "請填寫簽署人資料" }, { status: 400 });
    }

    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: "找不到此預約" }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUrl = await uploadPreSessionSignedDocServer(
      project.studioId,
      projectId,
      documentId.trim(),
      buffer,
      file.type,
      file.name
    );

    const result = await submitClientPreSessionSignature({
      client,
      projectId,
      studioSlug: studioSlug.trim(),
      documentId: documentId.trim(),
      fileUrl,
      clientSignatureDataUrl:
        typeof clientSignatureDataUrl === "string" &&
        clientSignatureDataUrl.startsWith("data:image/")
          ? clientSignatureDataUrl
          : undefined,
      signerInfo,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      documentId: result.documentId,
      status: "completed",
    });
  } catch (error) {
    console.error("Pre-session client sign upload failed:", error);
    return NextResponse.json({ error: "簽署失敗，請稍後再試" }, { status: 500 });
  }
}
