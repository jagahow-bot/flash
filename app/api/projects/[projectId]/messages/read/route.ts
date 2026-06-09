import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveDiscussionAuthorRole } from "@/lib/project/resolve-discussion-context";
import { requireClientUser } from "@/lib/auth/require-client";
import { requireStudioProjectAccess } from "@/lib/auth/require-studio-project";
import {
  getProjectById,
  updateProjectFields,
} from "@/lib/firestore/projects.server";

const readSchema = z.object({
  context: z.enum(["client", "studio"]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const { context } = readSchema.parse(body);

    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: "找不到此預約" }, { status: 404 });
    }

    const studioAccess = await requireStudioProjectAccess(projectId);
    const client = await requireClientUser();
    const authorRole = resolveDiscussionAuthorRole(
      context,
      project,
      studioAccess?.user ?? null,
      client
    );

    if (!authorRole) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const now = new Date();
    const nextProject = {
      ...project,
      clientDiscussionReadAt:
        context === "client" ? now : project.clientDiscussionReadAt,
      studioDiscussionReadAt:
        context === "studio" ? now : project.studioDiscussionReadAt,
    };

    await updateProjectFields(projectId, nextProject);

    return NextResponse.json({ success: true, readAt: now.toISOString() });
  } catch (error) {
    console.error("Mark discussion read failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "資料格式不正確" }, { status: 400 });
    }

    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}
