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
import { mapSessionCreationError } from "@/lib/auth/session-error";
import {
  getAuthMessages,
  messageForSessionErrorCode,
} from "@/lib/auth/session-messages.server";
import { seedPreferredLocaleFromCookie } from "@/lib/i18n/seed-preferred-locale.server";
import { setLocaleCookieOnResponse } from "@/lib/i18n/set-locale-cookie";
import { createStudioAdminUser } from "@/lib/firestore/users.server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  const authMessages = await getAuthMessages(request);

  try {
    const { idToken, redirectTo } = await request.json();

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: authMessages.missingIdToken, code: "MISSING_ID_TOKEN" },
        { status: 400 },
      );
    }

    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    const userRef = getAdminDb().collection("users").doc(decoded.uid);
    let userDoc = await userRef.get();

    if (!userDoc.exists) {
      const email = decoded.email?.trim();
      if (!email) {
        return NextResponse.json(
          { error: authMessages.accountNotFound, code: "ACCOUNT_NOT_FOUND" },
          { status: 403 },
        );
      }

      await createStudioAdminUser(decoded.uid, email);
      userDoc = await userRef.get();
    }

    const user = normalizeUserRecord(
      decoded.uid,
      userDoc.data(),
      decoded.email ?? "",
    );

    if (!user) {
      return NextResponse.json(
        { error: authMessages.accountNotFound, code: "ACCOUNT_NOT_FOUND" },
        { status: 403 },
      );
    }

    if (!canActAsClient(user) && !canAccessStudioPortal(user)) {
      return NextResponse.json(
        { error: authMessages.accountCannotLogin, code: "ACCOUNT_CANNOT_LOGIN" },
        { status: 403 },
      );
    }

    const preferredLocale = await seedPreferredLocaleFromCookie(
      request,
      user.uid,
      user.preferredLocale,
    );

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

    if (preferredLocale) {
      setLocaleCookieOnResponse(response, preferredLocale);
    }

    return response;
  } catch (error) {
    console.error("Session creation failed:", error);
    const mapped = mapSessionCreationError(error);
    return NextResponse.json(
      {
        error: messageForSessionErrorCode(authMessages, mapped.code),
        code: mapped.code,
      },
      { status: mapped.status },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authMessages = await getAuthMessages(request);

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
    return NextResponse.json(
      { error: authMessages.logoutFailed, code: "LOGOUT_FAILED" },
      { status: 500 },
    );
  }
}
