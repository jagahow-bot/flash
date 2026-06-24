import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
} from "@/lib/auth/constants";
import { normalizeUserEmail } from "@/lib/auth/normalize-user-email";
import {
  PREVIEW_COOKIE_NAME,
  getPreviewSessionFromCookies,
  previewCookieOptions,
} from "@/lib/auth/preview-session";
import { checkRateLimit, getClientIp } from "@/lib/auth/rate-limit";
import { canAccessStudioPortal } from "@/lib/auth/user-roles";
import { sendStudioWelcomeEmail } from "@/lib/email/studio-welcome.server";
import {
  clearStudioClaimToken,
  isStudioClaimable,
  verifyClaimToken,
} from "@/lib/firestore/prospect-studios.server";
import { getStudioById } from "@/lib/firestore/studios.server";
import {
  createStudioAdminUser,
  getUserByEmail,
  getUserById,
  linkUserToStudio,
} from "@/lib/firestore/users.server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { resolveRecipientLocale } from "@/lib/email/resolve-recipient-locale.server";
import { seedPreferredLocaleFromCookie } from "@/lib/i18n/seed-preferred-locale.server";
import { setLocaleCookieOnResponse } from "@/lib/i18n/set-locale-cookie";

const schema = z.object({
  idToken: z.string().min(1),
  token: z.string().min(16).optional(),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`activate-studio:${ip}`, 10, 15 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "請求過於頻繁，請稍後再試" },
      {
        status: 429,
        headers: rate.retryAfterSec
          ? { "Retry-After": String(rate.retryAfterSec) }
          : undefined,
      },
    );
  }

  try {
    const body = await request.json();
    const { idToken, token } = schema.parse(body);

    const preview = await getPreviewSessionFromCookies();
    let studioId = preview?.studioId;
    let prospectEmail = preview?.email;

    if (token) {
      const verified = await verifyClaimToken(token);
      if (!verified) {
        return NextResponse.json(
          { error: "連結無效或已過期" },
          { status: 400 },
        );
      }
      studioId = verified.studio.studioId;
      prospectEmail = verified.email;
    }

    if (!studioId || !prospectEmail) {
      return NextResponse.json({ error: "請先驗證認領連結" }, { status: 401 });
    }

    const studio = await getStudioById(studioId);
    if (!studio || !isStudioClaimable(studio)) {
      return NextResponse.json(
        { error: "此工作室無法啟用或已被認領" },
        { status: 400 },
      );
    }

    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    const tokenEmail = normalizeUserEmail(decoded.email ?? "");
    const expectedEmail = normalizeUserEmail(prospectEmail);

    if (!tokenEmail || tokenEmail !== expectedEmail) {
      return NextResponse.json(
        { error: "請使用邀請信中的 Email 註冊或登入" },
        { status: 403 },
      );
    }

    const existingByEmail = await getUserByEmail(expectedEmail);
    if (
      existingByEmail?.studioId &&
      existingByEmail.studioId !== studio.studioId
    ) {
      return NextResponse.json(
        { error: "此 Email 已綁定其他工作室" },
        { status: 409 },
      );
    }

    let user = await getUserById(decoded.uid);
    if (!user) {
      await createStudioAdminUser(decoded.uid, expectedEmail);
      user = await getUserById(decoded.uid);
    } else if (!canAccessStudioPortal(user)) {
      await createStudioAdminUser(decoded.uid, expectedEmail);
      user = await getUserById(decoded.uid);
    }

    if (!user) {
      throw new Error("Failed to load user after activation");
    }

    await linkUserToStudio(decoded.uid, studio.studioId);
    await clearStudioClaimToken(studio.studioId);

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    const preferredLocale = await seedPreferredLocaleFromCookie(
      request,
      user.uid,
      user.preferredLocale ?? studio.preferredLocale,
    );

    void sendStudioWelcomeEmail({
      email: expectedEmail,
      studioName: studio.name,
      studioSlug: studio.slug,
      locale: resolveRecipientLocale({
        ...user,
        preferredLocale: preferredLocale ?? user.preferredLocale,
      }),
    });

    const response = NextResponse.json({
      redirect: "/dashboard",
      studioId: studio.studioId,
      slug: studio.slug,
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE_MS / 1000,
      path: "/",
      sameSite: "lax",
    });

    response.cookies.set(PREVIEW_COOKIE_NAME, "", previewCookieOptions(0));

    if (preferredLocale) {
      setLocaleCookieOnResponse(response, preferredLocale);
    }

    return response;
  } catch (error) {
    console.error("Studio activation failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "請求格式不正確" }, { status: 400 });
    }

    return NextResponse.json({ error: "啟用失敗，請稍後再試" }, { status: 500 });
  }
}
