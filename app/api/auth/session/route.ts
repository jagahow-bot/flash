import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
} from "@/lib/auth/constants";
import {
  canAccessStudioPortal,
  canActAsClient,
  normalizeUserRecord,
} from "@/lib/auth/user-roles";
import { getPostLoginRedirect } from "@/lib/auth/redirects";
import { setLocaleCookieOnResponse } from "@/lib/i18n/set-locale-cookie";
import { createStudioAdminUser } from "@/lib/firestore/users.server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { idToken, redirectTo } = await request.json();

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "缺少 idToken" }, { status: 400 });
    }

    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    const userRef = getAdminDb().collection("users").doc(decoded.uid);
    let userDoc = await userRef.get();

    if (!userDoc.exists) {
      const email = decoded.email?.trim();
      if (!email) {
        return NextResponse.json(
          { error: "找不到帳號資料，請聯繫工作室管理員" },
          { status: 403 }
        );
      }

      // Firebase Auth 帳號存在但 Firestore 使用者文件被刪除時，自動補建 admin 資料
      await createStudioAdminUser(decoded.uid, email);
      userDoc = await userRef.get();
    }

    const user = normalizeUserRecord(
      decoded.uid,
      userDoc.data(),
      decoded.email ?? ""
    );

    if (!user) {
      return NextResponse.json(
        { error: "找不到帳號資料，請聯繫工作室管理員" },
        { status: 403 }
      );
    }

    if (!canActAsClient(user) && !canAccessStudioPortal(user)) {
      return NextResponse.json(
        { error: "此帳號無法登入，請聯繫工作室管理員" },
        { status: 403 }
      );
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    const response = NextResponse.json({
      redirect: getPostLoginRedirect(user, redirectTo),
      user: {
        uid: user.uid,
        email: user.email,
        role: user.role,
        studioId: user.studioId,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE_MS / 1000,
      path: "/",
      sameSite: "lax",
    });

    if (user.preferredLocale) {
      setLocaleCookieOnResponse(response, user.preferredLocale);
    }

    return response;
  } catch (error) {
    console.error("Session creation failed:", error);
    return NextResponse.json({ error: "登入驗證失敗" }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
      sameSite: "lax",
    });
    return response;
  } catch (error) {
    console.error("Session deletion failed:", error);
    return NextResponse.json({ error: "登出失敗" }, { status: 500 });
  }
}
