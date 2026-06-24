import { createHash } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const PREVIEW_COOKIE_NAME = "__flash_preview";
export const PREVIEW_JWT_MAX_AGE_SEC = 3 * 60 * 60;

export interface PreviewSessionPayload {
  studioId: string;
  email: string;
}

function getPreviewJwtSecret(): Uint8Array {
  const raw =
    process.env.PREVIEW_JWT_SECRET?.trim() ||
    process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim() ||
    "flash-preview-dev-secret";

  return new Uint8Array(createHash("sha256").update(raw).digest());
}

export async function signPreviewJwt(
  payload: PreviewSessionPayload,
): Promise<string> {
  return new SignJWT({
    studioId: payload.studioId,
    email: payload.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PREVIEW_JWT_MAX_AGE_SEC}s`)
    .sign(getPreviewJwtSecret());
}

export async function verifyPreviewJwt(
  token: string,
): Promise<PreviewSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getPreviewJwtSecret());
    const studioId =
      typeof payload.studioId === "string" ? payload.studioId.trim() : "";
    const email = typeof payload.email === "string" ? payload.email.trim() : "";

    if (!studioId || !email) {
      return null;
    }

    return { studioId, email };
  } catch {
    return null;
  }
}

export async function getPreviewSessionFromCookies(): Promise<PreviewSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PREVIEW_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  return verifyPreviewJwt(token);
}

export function previewCookieOptions(maxAgeSec = PREVIEW_JWT_MAX_AGE_SEC) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAgeSec,
    path: "/",
    sameSite: "lax" as const,
  };
}
