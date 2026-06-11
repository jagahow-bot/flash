import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { flashDesignUpdateSchema } from "@/lib/api/flash-design-schema";
import { requireStudioAdmin } from "@/lib/auth/require-studio-admin";
import {
  deleteFlashDesign,
  getFlashDesignById,
  updateFlashDesign,
} from "@/lib/firestore/flash-designs.server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ designId: string }> }
) {
  try {
    const access = await requireStudioAdmin();

    if (!access) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const { designId } = await params;
    const existing = await getFlashDesignById(access.studioId, designId);

    if (!existing) {
      return NextResponse.json({ error: "找不到認領圖" }, { status: 404 });
    }

    const body = await request.json();
    const updates = flashDesignUpdateSchema.parse(body);

    await updateFlashDesign(access.studioId, designId, {
      title: updates.title?.trim(),
      imageUrl: updates.imageUrl,
      price: updates.price,
      allowedSizes: updates.allowedSizes?.map((size) => size.trim()),
      active: updates.active,
      sortOrder: updates.sortOrder,
    });

    const design = await getFlashDesignById(access.studioId, designId);
    return NextResponse.json({ design });
  } catch (error) {
    console.error("Update flash design failed:", error);

    if (error instanceof z.ZodError) {
      const message = error.issues[0]?.message ?? "資料格式不正確";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (error instanceof Error && error.message === "FLASH_DESIGN_NOT_FOUND") {
      return NextResponse.json({ error: "找不到認領圖" }, { status: 404 });
    }

    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ designId: string }> }
) {
  try {
    const access = await requireStudioAdmin();

    if (!access) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const { designId } = await params;
    const existing = await getFlashDesignById(access.studioId, designId);

    if (!existing) {
      return NextResponse.json({ error: "找不到認領圖" }, { status: 404 });
    }

    await deleteFlashDesign(access.studioId, designId);
    return NextResponse.json({ designId });
  } catch (error) {
    console.error("Delete flash design failed:", error);
    return NextResponse.json({ error: "刪除失敗" }, { status: 500 });
  }
}
