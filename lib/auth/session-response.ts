import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
} from "@/lib/auth/constants";
import { getAdminAuth } from "@/lib/firebase-admin";
import { setLocaleCookieOnResponse } from "@/lib/i18n/set-locale-cookie";
import type { User } from "@/types/user";

export async function createSessionResponse(
  idToken: string,
  payload: {
    redirect: string;
    user: Pick<User, "uid" | "email" | "role" | "studioId" | "preferredLocale">;
  },
): Promise<NextResponse> {
  const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_MS,
  });

  const response = NextResponse.json(payload);

  response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_MS / 1000,
    path: "/",
    sameSite: "lax",
  });

  if (payload.user.preferredLocale) {
    setLocaleCookieOnResponse(response, payload.user.preferredLocale);
  }

  return response;
}
