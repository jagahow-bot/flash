import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
} from "@/lib/auth/constants";
import { getPostLoginRedirect } from "@/lib/auth/redirects";
import { hasUserRole } from "@/lib/auth/user-roles";
import {
  createStudioAdminUser,
  getUserById,
  UserAlreadyExistsError,
} from "@/lib/firestore/users.server";
import { getAdminAuth } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  let uid: string | null = null;

  try {
    const { idToken } = await request.json();

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "缺少 idToken" }, { status: 400 });
    }

    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    uid = decoded.uid;

    const existing = await getUserById(decoded.uid);
    if (existing) {
      if (hasUserRole(existing, "admin") && existing.studioId) {
        return NextResponse.json(
          { error: "此帳號已註冊，請直接登入" },
          { status: 409 }
        );
      }

      if (!hasUserRole(existing, "admin")) {
        await createStudioAdminUser(decoded.uid, existing.email);
      }
    } else {
      const email = decoded.email?.trim();
      if (!email) {
        return NextResponse.json(
          { error: "Email 為必填，請重新註冊" },
          { status: 400 }
        );
      }

      await createStudioAdminUser(decoded.uid, email);
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    const user = await getUserById(decoded.uid);
    if (!user) {
      throw new Error("Failed to load user after registration");
    }

    const response = NextResponse.json({
      redirect: getPostLoginRedirect(user),
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE_MS / 1000,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Registration failed:", error);

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
