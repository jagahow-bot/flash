import { NextRequest, NextResponse } from "next/server";
import { createSessionResponse } from "@/lib/auth/session-response";
import {
  canAccessStudioPortal,
  hasUserRole,
} from "@/lib/auth/user-roles";
import {
  createClientUser,
  getUserById,
  UserAlreadyExistsError,
} from "@/lib/firestore/users.server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { seedPreferredLocaleFromCookie } from "@/lib/i18n/seed-preferred-locale.server";

export async function POST(request: NextRequest) {
  let uid: string | null = null;

  try {
    const { idToken, redirectTo } = await request.json();

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "缺少 idToken" }, { status: 400 });
    }

    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    uid = decoded.uid;

    const existing = await getUserById(decoded.uid);
    if (existing) {
      if (hasUserRole(existing, "client")) {
        return NextResponse.json(
          { error: "此帳號已註冊，請直接登入" },
          { status: 409 }
        );
      }

      if (canAccessStudioPortal(existing)) {
        const redirect =
          typeof redirectTo === "string" && redirectTo.startsWith("/")
            ? redirectTo
            : "/";

        const preferredLocale = await seedPreferredLocaleFromCookie(
          request,
          existing.uid,
          existing.preferredLocale,
        );

        return createSessionResponse(idToken, {
          redirect,
          user: {
            uid: existing.uid,
            email: existing.email,
            role: existing.role,
            studioId: existing.studioId,
            preferredLocale,
          },
        });
      }

      return NextResponse.json(
        { error: "此帳號無法用於客戶註冊" },
        { status: 409 }
      );
    }

    const email = decoded.email?.trim();
    if (!email) {
      return NextResponse.json(
        { error: "Email 為必填，請改用 Email 註冊或於 Google 帳號中提供 Email" },
        { status: 400 }
      );
    }

    await createClientUser(decoded.uid, email);

    const user = await getUserById(decoded.uid);
    if (!user) {
      throw new Error("Failed to load user after registration");
    }

    const redirect =
      typeof redirectTo === "string" && redirectTo.startsWith("/")
        ? redirectTo
        : "/";

    const preferredLocale = await seedPreferredLocaleFromCookie(
      request,
      user.uid,
      user.preferredLocale,
    );

    return createSessionResponse(idToken, {
      redirect,
      user: {
        uid: user.uid,
        email: user.email,
        role: user.role,
        studioId: user.studioId,
        preferredLocale,
      },
    });
  } catch (error) {
    console.error("Client registration failed:", error);

    if (uid) {
      try {
        await getAdminAuth().deleteUser(uid);
      } catch (deleteError) {
        console.error("Failed to roll back auth user:", deleteError);
      }
    }

    if (error instanceof UserAlreadyExistsError) {
      return NextResponse.json(
        { error: "此帳號已註冊，請直接登入" },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "註冊失敗，請稍後再試" }, { status: 500 });
  }
}
