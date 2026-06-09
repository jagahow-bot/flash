import { NextRequest, NextResponse } from "next/server";
import { createSessionResponse } from "@/lib/auth/session-response";
import { canActAsClient } from "@/lib/auth/user-roles";
import { getUserById } from "@/lib/firestore/users.server";
import { getAdminAuth } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { idToken, redirectTo } = await request.json();

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "缺少 idToken" }, { status: 400 });
    }

    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const user = await getUserById(decoded.uid);

    if (!user) {
      return NextResponse.json(
        { error: "找不到帳號，請先註冊" },
        { status: 403 }
      );
    }

    if (!canActAsClient(user)) {
      return NextResponse.json(
        { error: "此帳號無法用於客戶登入" },
        { status: 403 }
      );
    }

    const redirect =
      typeof redirectTo === "string" && redirectTo.startsWith("/")
        ? redirectTo
        : "/";

    return createSessionResponse(idToken, {
      redirect,
      user: {
        uid: user.uid,
        email: user.email,
        role: user.role,
        studioId: user.studioId,
        preferredLocale: user.preferredLocale,
      },
    });
  } catch (error) {
    console.error("Client session creation failed:", error);
    return NextResponse.json({ error: "登入驗證失敗" }, { status: 401 });
  }
}
