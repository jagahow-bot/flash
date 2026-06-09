import type { NextRequest } from "next/server";
import type { SessionErrorCode } from "@/lib/auth/session-error";
import type { AppDictionary } from "@/lib/i18n/app-types";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { resolveApiLocale } from "@/lib/i18n/resolve-api-locale";

const SESSION_ERROR_KEY: Record<
  SessionErrorCode,
  keyof Pick<
    AppDictionary["auth"],
    | "adminNotConfigured"
    | "adminKeyInvalid"
    | "invalidIdToken"
    | "sessionCreateFailed"
  >
> = {
  ADMIN_NOT_CONFIGURED: "adminNotConfigured",
  ADMIN_KEY_INVALID: "adminKeyInvalid",
  INVALID_ID_TOKEN: "invalidIdToken",
  SESSION_CREATE_FAILED: "sessionCreateFailed",
};

export async function getAuthMessages(
  request: NextRequest,
): Promise<AppDictionary["auth"]> {
  const locale = await resolveApiLocale(request);
  const dict = await getAppDictionary(locale);
  return dict.auth;
}

export function messageForSessionErrorCode(
  auth: AppDictionary["auth"],
  code: SessionErrorCode,
): string {
  const key = SESSION_ERROR_KEY[code];
  return auth[key] ?? auth.sessionCreateFailed;
}
