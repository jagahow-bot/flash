import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireClientUser } from "@/lib/auth/require-client";
import { requireStudioProjectAccess } from "@/lib/auth/require-studio-project";
import {
  ensurePreSessionDocumentRecords,
  getPreSessionRecords,
} from "@/lib/pre-session-documents/records";
import { submitClientPreSessionSignature } from "@/lib/project/client-pre-session-sign.server";
import {
  notifyPreSessionDocumentCompleted,
} from "@/lib/email/project-notifications.server";
import {
  getProjectById,
  updateProjectFields,
} from "@/lib/firestore/projects.server";
import { getStudioById } from "@/lib/firestore/studios.server";
import { serverPreSessionSignerInfoSchema } from "@/lib/validations/pre-session-signer";
import type { PreSessionDocumentRecord } from "@/types/pre-session-document";

const studioCompleteSchema = z.object({
  documentId: z.string().min(1),
  fileUrl: z.string().url(),
});

const clientSignSchema = z.object({
  studioSlug: z.string().min(1),
  documentId: z.string().min(1),
  fileUrl: z.string().url(),
  clientSignatureDataUrl: z.string().optional(),
  signerInfo: serverPreSessionSignerInfoSchema,
});

function updateRecord(
  records: PreSessionDocumentRecord[],
  documentId: string,
  patch: Partial<PreSessionDocumentRecord>
): PreSessionDocumentRecord[] {
  return records.map((record) =>
    record.documentId === documentId ? { ...record, ...patch } : record
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const access = await requireStudioProjectAccess(projectId);

    if (!access) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const body = await request.json();
    const { documentId, fileUrl } = studioCompleteSchema.parse(body);
    const { project, user } = access;

    if (project.status !== "booked" && project.status !== "completed") {
      return NextResponse.json(
        { error: "目前無法上傳術前文件" },
        { status: 400 }
      );
    }

    const studio = await getStudioById(project.studioId);
    if (!studio) {
      return NextResponse.json({ error: "找不到工作室" }, { status: 404 });
    }

    const records =
      ensurePreSessionDocumentRecords(project, studio) ??
      getPreSessionRecords(project, studio);
    const record = records.find((item) => item.documentId === documentId);

    if (!record) {
      return NextResponse.json({ error: "找不到此文件" }, { status: 404 });
    }

    if (record.signatureMode !== "in_person") {
      return NextResponse.json(
        { error: "此文件需由客戶線上簽署" },
        { status: 400 }
      );
    }

    if (record.status === "completed") {
      return NextResponse.json({ error: "此文件已完成" }, { status: 400 });
    }

    const nextRecords = updateRecord(records, documentId, {
      status: "completed",
      completedAt: new Date(),
      completionMethod: "studio_upload",
      fileUrl,
      signedByUserId: user.uid,
    });

    const nextProject = { ...project, preSessionDocumentRecords: nextRecords };
    await updateProjectFields(projectId, nextProject);

    notifyPreSessionDocumentCompleted(nextProject, studio, {
      documentTitle: record.title,
      completionMethod: "studio_upload",
    });

    return NextResponse.json({ documentId, status: "completed" });
  } catch (error) {
    console.error("Pre-session studio upload failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "資料格式不正確" }, { status: 400 });
    }

    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}

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
    const body = await request.json();
    const { studioSlug, documentId, fileUrl, clientSignatureDataUrl, signerInfo } =
      clientSignSchema.parse(body);

    const result = await submitClientPreSessionSignature({
      client,
      projectId,
      studioSlug,
      documentId,
      fileUrl,
      clientSignatureDataUrl,
      signerInfo,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ documentId: result.documentId, status: "completed" });
  } catch (error) {
    console.error("Pre-session client sign failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "資料格式不正確" }, { status: 400 });
    }

    return NextResponse.json({ error: "簽署失敗" }, { status: 500 });
  }
}
