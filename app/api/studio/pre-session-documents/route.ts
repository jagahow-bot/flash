import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireStudioAdmin } from "@/lib/auth/require-studio-admin";
import {
  getStudioById,
  updateStudioFields,
} from "@/lib/firestore/studios.server";

const preSessionDocumentSchema = z.object({
  documentId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  templateFileUrl: z.string().url(),
  signatureMode: z.enum(["in_person", "online_advance"]),
  isRequired: z.boolean(),
  sortOrder: z.number().int().min(0),
  createdAt: z.string().datetime().optional(),
});

const updateSchema = z.object({
  preSessionDocuments: z.array(preSessionDocumentSchema),
});

export async function PATCH(request: NextRequest) {
  try {
    const access = await requireStudioAdmin();

    if (!access) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const body = await request.json();
    const { preSessionDocuments } = updateSchema.parse(body);

    const studio = await getStudioById(access.studioId);
    if (!studio) {
      return NextResponse.json({ error: "找不到工作室" }, { status: 404 });
    }

    await updateStudioFields(access.studioId, {
      preSessionDocuments: preSessionDocuments.map((doc) => ({
        ...doc,
        createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
      })),
    });

    return NextResponse.json({ studioId: access.studioId });
  } catch (error) {
    console.error("Pre-session documents update failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "資料格式不正確" }, { status: 400 });
    }

    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}
