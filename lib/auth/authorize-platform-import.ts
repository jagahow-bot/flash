import type { NextRequest } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth/require-platform-admin";
import type { User } from "@/types/user";

function readImportApiKey(request: NextRequest): string | null {
  const headerKey = request.headers.get("x-platform-import-key")?.trim();
  if (headerKey) {
    return headerKey;
  }

  const authorization = request.headers.get("authorization")?.trim();
  if (!authorization) {
    return null;
  }

  const bearerMatch = authorization.match(/^Bearer\s+(.+)$/i);
  return bearerMatch?.[1]?.trim() ?? null;
}

/** Platform admin session or PLATFORM_IMPORT_API_KEY for service-to-service imports. */
export async function authorizePlatformImport(
  request: NextRequest,
): Promise<User | null> {
  const sessionUser = await requirePlatformAdmin();
  if (sessionUser) {
    return sessionUser;
  }

  const expectedKey = process.env.PLATFORM_IMPORT_API_KEY?.trim();
  if (!expectedKey) {
    return null;
  }

  const providedKey = readImportApiKey(request);
  if (!providedKey || providedKey !== expectedKey) {
    return null;
  }

  return {
    uid: "platform-import",
    email: "platform-import@service",
    role: "platform_admin",
  };
}
