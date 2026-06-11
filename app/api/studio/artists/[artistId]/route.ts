import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireStudioAdmin } from "@/lib/auth/require-studio-admin";
import {
  getArtistById,
  updateArtistFields,
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

const updateArtistSchema = z.object({
  displayName: z.string().min(1).optional(),
  styles: z.array(z.string()).optional(),
  bio: z.string().optional(),
  userEmail: z.union([z.string().email(), z.literal(""), z.null()]).optional(),
  isActive: z.boolean().optional(),
  weeklySchedule: weeklyScheduleSchema,
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ artistId: string }> }
) {
  try {
    const access = await requireStudioAdmin();

    if (!access) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const { artistId } = await params;
    const artist = await getArtistById(artistId);

    if (!artist || artist.studioId !== access.studioId) {
      return NextResponse.json({ error: "找不到刺青師" }, { status: 404 });
    }

    const body = await request.json();
    const updates = updateArtistSchema.parse(body);

    let resolvedUserEmail: string | null | undefined = undefined;
    let createdAccount = false;
    let temporaryPassword: string | undefined;

    if (updates.userEmail === null) {
      resolvedUserEmail = null;
    } else if (updates.userEmail !== undefined) {
      const provision = await provisionArtistUserEmail(
        updates.userEmail,
        access.studioId,
        { excludeArtistId: artistId }
      );
      resolvedUserEmail = provision?.userEmail;
      createdAccount = provision?.createdAccount ?? false;
      temporaryPassword = provision?.temporaryPassword;
    }

    const temporaryPasswordUpdate =
      updates.userEmail !== undefined
        ? temporaryPassword ?? null
        : undefined;

    await updateArtistFields(artistId, access.studioId, {
      displayName: updates.displayName,
      styles: updates.styles,
      bio: updates.bio,
      isActive: updates.isActive,
      userEmail: resolvedUserEmail,
      temporaryPassword: temporaryPasswordUpdate,
      weeklySchedule:
        updates.weeklySchedule === undefined
          ? undefined
          : updates.weeklySchedule === null
            ? null
            : normalizeWeeklySchedule(
                updates.weeklySchedule as StudioWeeklySchedule
              ),
    });

    if (updates.isActive !== undefined) {
      await syncStudioArtistIds(access.studioId);
    }

    return NextResponse.json({
      artistId,
      createdAccount,
      temporaryPassword,
    });
  } catch (error) {
    console.error("Update artist failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "資料格式不正確" }, { status: 400 });
    }

    if (error instanceof ArtistBindError) {
      return NextResponse.json(
        { error: artistBindErrorMessage(error) },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}
