import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { flashDesignBodySchema } from "@/lib/api/flash-design-schema";
import { requireStudioAdmin } from "@/lib/auth/require-studio-admin";
import {
  createFlashDesign,
  getFlashDesignsByStudioId,
} from "@/lib/firestore/flash-designs.server";

export async function GET() {
  const access = await requireStudioAdmin();

  if (!access) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const designs = await getFlashDesignsByStudioId(access.studioId);
  return NextResponse.json({ designs });
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireStudioAdmin();

    if (!access) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const body = await request.json();
    const data = flashDesignBodySchema.parse(body);

    const existing = await getFlashDesignsByStudioId(access.studioId);
    const design = await createFlashDesign(access.studioId, {
      title: data.title.trim(),
      imageUrl: data.imageUrl,
      price: data.price ?? null,
      allowedSizes: data.allowedSizes.map((size) => size.trim()),
      active: data.active ?? true,
      sortOrder: data.sortOrder ?? existing.length,
    });

    return NextResponse.json({ design });
  } catch (error) {
    console.error("Create flash design failed:", error);

    if (error instanceof z.ZodError) {
      const message = error.issues[0]?.message ?? "資料格式不正確";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: "新增失敗" }, { status: 500 });
  }
}
