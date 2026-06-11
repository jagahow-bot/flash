import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireStudioAdmin } from "@/lib/auth/require-studio-admin";
import {
  createArtist,
  getArtistsByStudioId,
} from "@/lib/firestore/artists.server";
import { syncStudioArtistIds } from "@/lib/firestore/studios.server";
import { weeklyScheduleSchema } from "@/lib/api/weekly-schedule-schema";
import {
  ArtistBindError,
  artistBindErrorMessage,
} from "@/lib/artists/bind-user-email.server";
import { provisionArtistUserEmail } from "@/lib/auth/provision-artist-user.server";
import { normalizeWeeklySchedule } from "@/lib/availability/weekly-schedule";
import type { StudioWeeklySchedule } from "@/types/operating-hours";

const createArtistSchema = z.object({
  displayName: z.string().min(1),
  styles: z.array(z.string()).default([]),
  bio: z.string().optional(),
  userEmail: z.union([z.string().email(), z.literal("")]).optional(),
  weeklySchedule: weeklyScheduleSchema,
});

export async function GET() {
  const access = await requireStudioAdmin();

  if (!access) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const artists = await getArtistsByStudioId(access.studioId);
  return NextResponse.json({ artists });
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireStudioAdmin();

    if (!access) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const body = await request.json();
    const data = createArtistSchema.parse(body);
    const provision = await provisionArtistUserEmail(
      data.userEmail,
      access.studioId
    );

    const artist = await createArtist({
      studioId: access.studioId,
      displayName: data.displayName,
      styles: data.styles,
      bio: data.bio,
      userEmail: provision?.userEmail,
      temporaryPassword: provision?.temporaryPassword,
      isActive: true,
      weeklySchedule:
        data.weeklySchedule === null
          ? undefined
          : normalizeWeeklySchedule(
              data.weeklySchedule as StudioWeeklySchedule
            ),
    });

    await syncStudioArtistIds(access.studioId);

    return NextResponse.json({
      artist,
      createdAccount: provision?.createdAccount ?? false,
      temporaryPassword: provision?.temporaryPassword,
    });
  } catch (error) {
    console.error("Create artist failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "資料格式不正確" }, { status: 400 });
    }

    if (error instanceof ArtistBindError) {
      return NextResponse.json(
        { error: artistBindErrorMessage(error) },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "新增失敗" }, { status: 500 });
  }
}
