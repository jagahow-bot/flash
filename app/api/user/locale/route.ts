import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { locales } from "@/lib/i18n/config";
import { setLocaleCookieOnResponse } from "@/lib/i18n/set-locale-cookie";
import { updateUserPreferredLocale } from "@/lib/firestore/users.server";

const localeSchema = z.object({
  locale: z.enum(locales),
});

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ locale: null }, { status: 401 });
  }

  return NextResponse.json({ locale: user.preferredLocale ?? null });
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = localeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  await updateUserPreferredLocale(user.uid, parsed.data.locale);

  const response = NextResponse.json({ locale: parsed.data.locale });
  setLocaleCookieOnResponse(response, parsed.data.locale);
  return response;
}
