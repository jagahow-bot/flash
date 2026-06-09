import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireOnboardingAdmin } from "@/lib/auth/require-onboarding-admin";
import { weeklyScheduleSchema } from "@/lib/api/weekly-schedule-schema";
import { createStudio, isStudioSlugAvailable } from "@/lib/firestore/studios.server";
import { linkUserToStudio } from "@/lib/firestore/users.server";
import { normalizeWeeklySchedule } from "@/lib/availability/weekly-schedule";
import { isWeeklyScheduleValid } from "@/lib/availability/weekly-schedule";
import { normalizeBookingCode } from "@/lib/project/booking-number";
import { isValidStudioSlug } from "@/lib/studio/slug";
import type { StudioWeeklySchedule } from "@/types/operating-hours";

const onboardingSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(2).max(48),
  bookingCode: z
    .union([z.string().regex(/^[A-Za-z0-9]{2,12}$/), z.literal("")])
    .optional(),
  bio: z.string().optional(),
  paymentInfo: z.string().min(1),
  careGuide: z.string().optional(),
  acceptsCoverUp: z.boolean().default(true),
  weeklySchedule: weeklyScheduleSchema,
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireOnboardingAdmin();

    if (!user) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const body = await request.json();
    const data = onboardingSchema.parse(body);
    const slug = data.slug.trim().toLowerCase();

    if (!isValidStudioSlug(slug)) {
      return NextResponse.json({ error: "預約網址格式不正確" }, { status: 400 });
    }

    if (!(await isStudioSlugAvailable(slug))) {
      return NextResponse.json({ error: "此預約網址已被使用" }, { status: 409 });
    }

    const weeklySchedule = normalizeWeeklySchedule(
      data.weeklySchedule as StudioWeeklySchedule
    );

    if (!isWeeklyScheduleValid(weeklySchedule)) {
      return NextResponse.json(
        { error: "請確認營業時段為有效的 24 小時制時間" },
        { status: 400 }
      );
    }

    const studio = await createStudio({
      name: data.name.trim(),
      slug,
      bookingCode: data.bookingCode
        ? normalizeBookingCode(data.bookingCode)
        : undefined,
      bio: data.bio?.trim() ?? "",
      paymentInfo: data.paymentInfo.trim(),
      careGuide: data.careGuide?.trim() ?? "",
      acceptsCoverUp: data.acceptsCoverUp,
      weeklySchedule,
      preferredLocale: user.preferredLocale,
    });

    await linkUserToStudio(user.uid, studio.studioId);

    return NextResponse.json({
      studioId: studio.studioId,
      slug: studio.slug,
    });
  } catch (error) {
    console.error("Onboarding failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "資料格式不正確" }, { status: 400 });
    }

    if (error instanceof Error) {
      if (error.message.includes("Missing Firebase Admin credentials")) {
        return NextResponse.json(
          { error: "伺服器設定未完成，請聯繫系統管理員" },
          { status: 500 }
        );
      }

      if (error.message.includes("undefined")) {
        return NextResponse.json(
          { error: "資料寫入失敗，請稍後再試" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: "建立工作室失敗" }, { status: 500 });
  }
}
