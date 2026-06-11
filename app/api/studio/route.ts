import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireStudioAdmin } from "@/lib/auth/require-studio-admin";
import {
  closuresSchema,
  weeklyScheduleSchema,
} from "@/lib/api/weekly-schedule-schema";
import {
  getStudioById,
  updateStudioFields,
} from "@/lib/firestore/studios.server";
import { syncSoloStudioArtist } from "@/lib/studio/solo-studio.server";
import { normalizeClosures } from "@/lib/availability/closures";
import { normalizeBookingCode } from "@/lib/project/booking-number";
import {
  normalizeWeeklySchedule,
  weeklyScheduleToOperatingHours,
} from "@/lib/availability/weekly-schedule";
import { locales } from "@/lib/i18n/config";
import { normalizeStudioSocialLinks } from "@/lib/studio/social-links";
import type { StudioWeeklySchedule } from "@/types/operating-hours";
import type { StudioClosure } from "@/types/studio-closure";

const preSessionDocumentSchema = z.object({
  documentId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  templateFileUrl: z.string().url(),
  signatureMode: z.enum(["in_person", "online_advance"]),
  isRequired: z.boolean(),
  sortOrder: z.number().int().min(0),
  createdAt: z.string().datetime().optional(),
});

const studioSocialLinksSchema = z
  .object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    line: z.string().optional(),
    threads: z.string().optional(),
  })
  .optional();

const studioUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  bookingCode: z
    .union([
      z.string().regex(/^[A-Za-z0-9]{2,12}$/),
      z.literal(""),
      z.null(),
    ])
    .optional(),
  logoUrl: z.union([z.string().url(), z.null()]).optional(),
  bio: z.string().optional(),
  paymentInfo: z.string().optional(),
  depositDeadlineDays: z.number().int().min(1).max(30).optional(),
  careGuide: z.string().optional(),
  acceptsCoverUp: z.boolean().optional(),
  isSoloStudio: z.boolean().optional(),
  weeklySchedule: weeklyScheduleSchema,
  closures: closuresSchema,
  preSessionDocuments: z.array(preSessionDocumentSchema).optional(),
  socialLinks: z.union([studioSocialLinksSchema, z.null()]).optional(),
  preferredLocale: z.enum(locales).optional(),
  watermarkSketches: z.boolean().optional(),
  flashBookingEnabled: z.boolean().optional(),
  flashUniformPrice: z.number().min(0).nullable().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const access = await requireStudioAdmin();

    if (!access) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const body = await request.json();
    const updates = studioUpdateSchema.parse(body);
    const studio = await getStudioById(access.studioId);

    if (!studio) {
      return NextResponse.json({ error: "找不到工作室" }, { status: 404 });
    }

    const weeklySchedule = updates.weeklySchedule
      ? normalizeWeeklySchedule(updates.weeklySchedule as StudioWeeklySchedule)
      : undefined;
    const closures = updates.closures
      ? normalizeClosures(updates.closures as StudioClosure[])
      : undefined;

    const bookingCode =
      updates.bookingCode === undefined
        ? undefined
        : updates.bookingCode === null || updates.bookingCode === ""
          ? null
          : normalizeBookingCode(updates.bookingCode);

    const preSessionDocuments = updates.preSessionDocuments?.map((doc) => ({
      ...doc,
      createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    }));

    const socialLinks =
      updates.socialLinks === undefined
        ? undefined
        : updates.socialLinks === null
          ? null
          : normalizeStudioSocialLinks(updates.socialLinks) ?? null;

    const {
      weeklySchedule: _weeklySchedule,
      closures: _closures,
      bookingCode: _bookingCode,
      preSessionDocuments: _preSessionDocuments,
      socialLinks: _socialLinks,
      ...rest
    } = updates;

    await updateStudioFields(access.studioId, {
      ...rest,
      weeklySchedule,
      closures,
      bookingCode,
      preSessionDocuments,
      socialLinks,
      operatingHours: weeklySchedule
        ? weeklyScheduleToOperatingHours(weeklySchedule)
        : undefined,
    });

    const nextStudio = await getStudioById(access.studioId);
    if (nextStudio?.isSoloStudio) {
      await syncSoloStudioArtist(
        access.studioId,
        access.user.email,
        updates.name?.trim() || nextStudio.name
      );
    }

    return NextResponse.json({ studioId: access.studioId });
  } catch (error) {
    console.error("Studio update failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "資料格式不正確" }, { status: 400 });
    }

    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}
