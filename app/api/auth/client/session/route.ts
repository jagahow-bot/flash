import { NextRequest, NextResponse } from "next/server";
import { createSessionResponse } from "@/lib/auth/session-response";
import { canActAsClient } from "@/lib/auth/user-roles";
import { mapSessionCreationError } from "@/lib/auth/session-error";
import {
  getAuthMessages,
  messageForSessionErrorCode,
} from "@/lib/auth/session-messages.server";
import { getUserById } from "@/lib/firestore/users.server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { seedPreferredLocaleFromCookie } from "@/lib/i18n/seed-preferred-locale.server";

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

    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const user = await getUserById(decoded.uid);

    if (!user) {
      return NextResponse.json(
        { error: authMessages.clientNotRegistered, code: "ACCOUNT_NOT_FOUND" },
        { status: 403 },
      );
    }

    if (!canActAsClient(user)) {
      return NextResponse.json(
        {
          error: authMessages.clientAccountCannotLogin,
          code: "ACCOUNT_CANNOT_LOGIN",
        },
        { status: 403 },
      );
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
    console.error("Client session creation failed:", error);
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
