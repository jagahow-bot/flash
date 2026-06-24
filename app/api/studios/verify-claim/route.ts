import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  PREVIEW_COOKIE_NAME,
  PREVIEW_JWT_MAX_AGE_SEC,
  previewCookieOptions,
  signPreviewJwt,
} from "@/lib/auth/preview-session";
import { checkRateLimit, getClientIp } from "@/lib/auth/rate-limit";
import { verifyClaimToken } from "@/lib/firestore/prospect-studios.server";

const schema = z.object({
  token: z.string().min(16),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`verify-claim:${ip}`, 20, 15 * 60 * 1000);
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
    const { token } = schema.parse(body);
    const verified = await verifyClaimToken(token);

    if (!verified) {
      return NextResponse.json(
        { error: "連結無效或已過期" },
        { status: 400 },
      );
    }

    const { studio, email } = verified;
    const previewJwt = await signPreviewJwt({
      studioId: studio.studioId,
      email,
    });

    const response = NextResponse.json({
      studioId: studio.studioId,
      studioName: studio.name,
      studioSlug: studio.slug,
      email,
      redirect: "/preview/dashboard",
    });

    response.cookies.set(
      PREVIEW_COOKIE_NAME,
      previewJwt,
      previewCookieOptions(PREVIEW_JWT_MAX_AGE_SEC),
    );

    return response;
  } catch (error) {
    console.error("Verify claim failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "請求格式不正確" }, { status: 400 });
    }

    return NextResponse.json({ error: "驗證失敗，請稍後再試" }, { status: 500 });
  }
}
