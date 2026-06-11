import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  intakeFormBodySchema,
  normalizeSocialContacts,
} from "@/lib/api/intake-form-schema";
import { isUserEmailVerified } from "@/lib/auth/email-verified.server";
import { requireClientUser } from "@/lib/auth/require-client";
import { notifyNewIntake } from "@/lib/email/project-notifications.server";
import {
  createFlashSessionDetails,
  generateFlashBrief,
} from "@/lib/ai/flash-brief";
import { generateTattooBrief } from "@/lib/ai/generate-brief";
import {
  getFlashDesignById,
  resolveFlashDesignPrice,
} from "@/lib/firestore/flash-designs.server";
import { allocateBookingNumber } from "@/lib/project/booking-number.server";
import { getStudioBySlug } from "@/lib/firestore/studios.server";
import { resolveStudioLocale } from "@/lib/studio/resolve-studio-locale";
import { COLLECTIONS } from "@/lib/firestore/collections";
import { projectToFirestore } from "@/lib/firestore/serializers";
import { getAdminDb } from "@/lib/firebase-admin";
import { isValidAvailabilitySelection } from "@/lib/availability/slots";
import type { IntakeForm } from "@/types/intake-form";
import type { Project } from "@/types/project";

const intakeSchema = z.object({
  studioSlug: z.string().min(1),
  intakeForm: intakeFormBodySchema,
});

export async function POST(request: NextRequest) {
  try {
    const client = await requireClientUser();

    if (!client) {
      return NextResponse.json({ error: "請先登入客戶帳號" }, { status: 401 });
    }

    const emailVerified = await isUserEmailVerified(client.uid);
    if (!emailVerified) {
      return NextResponse.json(
        { error: "請先至信箱完成 Email 驗證後再送出預約需求" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { studioSlug, intakeForm: rawIntakeForm } = intakeSchema.parse(body);
    const bookingType = rawIntakeForm.bookingType ?? "custom";
    const intakeForm: IntakeForm = {
      ...rawIntakeForm,
      bookingType,
      socialContacts: normalizeSocialContacts(rawIntakeForm.socialContacts),
    };

    const studio = await getStudioBySlug(studioSlug);

    if (!studio) {
      return NextResponse.json({ error: "找不到此工作室" }, { status: 404 });
    }

    if (bookingType === "flash") {
      if (!studio.flashBookingEnabled) {
        return NextResponse.json(
          { error: "此工作室目前未開放認領圖預約" },
          { status: 400 }
        );
      }

      if (!intakeForm.flashDesignId) {
        return NextResponse.json(
          { error: "請選擇認領圖" },
          { status: 400 }
        );
      }

      const flashDesign = await getFlashDesignById(
        studio.studioId,
        intakeForm.flashDesignId
      );

      if (!flashDesign || !flashDesign.active) {
        return NextResponse.json(
          { error: "所選認領圖不存在或已下架" },
          { status: 400 }
        );
      }

      if (!flashDesign.allowedSizes.includes(intakeForm.size)) {
        return NextResponse.json(
          { error: "所選尺寸不在此認領圖允許範圍內" },
          { status: 400 }
        );
      }

      const resolvedPrice = resolveFlashDesignPrice(
        flashDesign,
        studio.flashUniformPrice
      );

      if (resolvedPrice === null) {
        return NextResponse.json(
          { error: "此認領圖尚未設定價格" },
          { status: 400 }
        );
      }

      intakeForm.flashDesignTitle = flashDesign.title;
      intakeForm.flashImageUrl = flashDesign.imageUrl;
      intakeForm.flashPrice = resolvedPrice;
      intakeForm.style = intakeForm.style || "認領圖";
      intakeForm.description =
        intakeForm.description ||
        `認領圖：${flashDesign.title}`;
      intakeForm.isCoverUp = false;
    } else if (intakeForm.isCoverUp && !studio.acceptsCoverUp) {
      return NextResponse.json(
        { error: "此工作室目前不接受蓋圖需求" },
        { status: 400 }
      );
    }

    if (!isValidAvailabilitySelection(intakeForm.availability, studio.operatingHours)) {
      return NextResponse.json(
        { error: "所選時段不在工作室營業時間內" },
        { status: 400 }
      );
    }

    const studioLocale = resolveStudioLocale(studio);
    const tattooBrief =
      bookingType === "flash"
        ? await generateFlashBrief(intakeForm, studioLocale)
        : await generateTattooBrief(intakeForm, studioLocale);

    const projectId = await allocateBookingNumber(studio);
    const clientId = client.uid;
    const artistId = "";

    const flashSessionDetails =
      bookingType === "flash" && typeof intakeForm.flashPrice === "number"
        ? createFlashSessionDetails(intakeForm.flashPrice)
        : undefined;

    const project: Project = {
      projectId,
      studioId: studio.studioId,
      artistId,
      clientId,
      status: "quoting",
      intakeForm: intakeForm as IntakeForm,
      tattooBrief,
      sessionDetails: flashSessionDetails,
      sketches: [],
      finalPhotos: [],
      privateNotes: "",
    };

    await getAdminDb()
      .collection(COLLECTIONS.projects)
      .doc(projectId)
      .set(projectToFirestore(project));

    notifyNewIntake(project);

    return NextResponse.json({
      projectId,
      studioSlug: studio.slug,
      tattooBrief,
    });
  } catch (error) {
    console.error("Intake submission failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "表單資料格式不正確" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "提交失敗，請稍後再試" },
      { status: 500 }
    );
  }
}
