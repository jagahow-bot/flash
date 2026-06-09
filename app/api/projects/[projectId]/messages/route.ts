import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireClientUser } from "@/lib/auth/require-client";
import { requireStudioProjectAccess } from "@/lib/auth/require-studio-project";
import { canClientAccessProject } from "@/lib/project/client-access";
import {
  countUnreadDiscussionMessages,
  getDiscussionReadAt,
  isUnreadDiscussionMessage,
  type DiscussionContext,
} from "@/lib/project/discussion-read";
import { resolveDiscussionAuthorRole } from "@/lib/project/resolve-discussion-context";
import { notifyNewDiscussionMessage } from "@/lib/email/project-notifications.server";
import {
  createProjectMessage,
  getProjectMessages,
} from "@/lib/firestore/project-messages.server";
import {
  getProjectById,
  updateProjectFields,
} from "@/lib/firestore/projects.server";
import type { ProjectMessageKind } from "@/types/project-message";

const contextSchema = z.enum(["client", "studio"]);

const messageSchema = z.object({
  body: z.string().min(1, "請輸入留言內容").max(2000),
  kind: z
    .enum([
      "message",
      "request_intake_revision",
      "request_confirmation",
      "client_confirmed",
    ])
    .default("message"),
  context: contextSchema,
});

async function authorizeDiscussionAccess(
  projectId: string,
  context: DiscussionContext
) {
  const project = await getProjectById(projectId);

  if (!project) {
    return { error: NextResponse.json({ error: "找不到此預約" }, { status: 404 }) };
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
    return { error: NextResponse.json({ error: "未授權" }, { status: 401 }) };
  }

  return { project, studioAccess, client, authorRole };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const contextParam = request.nextUrl.searchParams.get("context");
    const parsedContext = contextSchema.safeParse(contextParam);

    if (!parsedContext.success) {
      return NextResponse.json({ error: "缺少有效的 context" }, { status: 400 });
    }

    const access = await authorizeDiscussionAccess(projectId, parsedContext.data);

    if ("error" in access) {
      return access.error;
    }

    const { project } = access;
    const messages = await getProjectMessages(projectId);
    const readAt = getDiscussionReadAt(project, parsedContext.data);
    const unreadCount = countUnreadDiscussionMessages(
      messages,
      parsedContext.data,
      project
    );

    return NextResponse.json({
      unreadCount,
      messages: messages.map((message) => ({
        ...message,
        createdAt: message.createdAt.toISOString(),
        isUnread: isUnreadDiscussionMessage(
          message,
          parsedContext.data,
          readAt
        ),
      })),
    });
  } catch (error) {
    console.error("List project messages failed:", error);
    return NextResponse.json({ error: "讀取失敗" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const data = messageSchema.parse(body);

    const access = await authorizeDiscussionAccess(projectId, data.context);

    if ("error" in access) {
      return access.error;
    }

    const { project, studioAccess, client, authorRole } = access;
    const kind = data.kind as ProjectMessageKind;

    if (
      (kind === "request_intake_revision" || kind === "request_confirmation") &&
      authorRole !== "studio"
    ) {
      return NextResponse.json({ error: "無法使用此留言類型" }, { status: 403 });
    }

    if (kind === "client_confirmed" && authorRole !== "client") {
      return NextResponse.json({ error: "無法使用此留言類型" }, { status: 403 });
    }

    const authorId =
      authorRole === "studio" ? studioAccess!.user.uid : client!.uid;
    const authorLabel =
      authorRole === "studio"
        ? studioAccess!.user.email || "工作室"
        : client!.email || "客戶";

    const message = await createProjectMessage({
      projectId,
      authorId,
      authorRole,
      authorLabel,
      body: data.body.trim(),
      kind,
    });

    if (kind === "request_intake_revision") {
      await updateProjectFields(projectId, {
        ...project,
        pendingIntakeRevision: true,
      });
    }

    notifyNewDiscussionMessage(project, {
      authorRole,
      authorLabel,
      body: message.body,
    });

    return NextResponse.json({
      message: {
        ...message,
        createdAt: message.createdAt.toISOString(),
        isUnread: false,
      },
    });
  } catch (error) {
    console.error("Create project message failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "資料格式不正確" }, { status: 400 });
    }

    return NextResponse.json({ error: "送出失敗" }, { status: 500 });
  }
}
