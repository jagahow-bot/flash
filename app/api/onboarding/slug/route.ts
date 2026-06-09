import { NextRequest, NextResponse } from "next/server";
import { requireOnboardingAdmin } from "@/lib/auth/require-onboarding-admin";
import { isStudioSlugAvailable } from "@/lib/firestore/studios.server";
import { isValidStudioSlug } from "@/lib/studio/slug";

export async function GET(request: NextRequest) {
  const user = await requireOnboardingAdmin();

  if (!user) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const slug = request.nextUrl.searchParams.get("slug")?.trim().toLowerCase() ?? "";

  if (!isValidStudioSlug(slug)) {
    return NextResponse.json({ available: false, reason: "invalid" });
  }

  const available = await isStudioSlugAvailable(slug);
  return NextResponse.json({ available });
}
