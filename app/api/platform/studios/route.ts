import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth/require-platform-admin";
import { listPlatformStudioSummaries } from "@/lib/firestore/platform-studios.server";

export async function GET() {
  const user = await requirePlatformAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const studios = await listPlatformStudioSummaries();
    return NextResponse.json({ studios });
  } catch (error) {
    console.error("Failed to list platform studios:", error);
    return NextResponse.json(
      { error: "Failed to load studios" },
      { status: 500 }
    );
  }
}
