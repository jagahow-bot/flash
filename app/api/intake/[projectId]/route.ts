import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  intakeFormBodySchema,
  normalizeSocialContacts,
} from "@/lib/api/intake-form-schema";
import { requireClientUser } from "@/lib/auth/require-client";
import { generateTattooBrief } from "@/lib/ai/generate-brief";
import { isValidAvailabilitySelection } from "@/lib/availability/slots";
import { getProjectById, updateProjectIntake } from "@/lib/firestore/projects.server";
import { getStudioBySlug } from "@/lib/firestore/studios.server";
import { resolveStudioLocale } from "@/lib/studio/resolve-studio-locale";
import { canClientEditProject } from "@/lib/project/client-intake-edit";
import { canClientAccessProject } from "@/lib/project/client-access";
import type { IntakeForm } from "@/types/intake-form";

const intakeBodySchema = z.object({
  studioSlug: z.string().min(1),
  intakeForm: intakeFormBodySchema,
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const client = await requireClientUser();

    if (!client) {
      return NextResponse.json({ error: "請先登入客戶帳號" }, { status: 401 });
    }

    const { projectId } = await params;
    const body = await request.json();
    const { studioSlug, intakeForm: rawIntakeForm } = intakeBodySchema.parse(body);
    const intakeForm: IntakeForm = {
      ...rawIntakeForm,
      socialContacts: normalizeSocialContacts(rawIntakeForm.socialContacts),
    };

    const [studio, project] = await Promise.all([
      getStudioBySlug(studioSlug),
      getProjectById(projectId),
    ]);

    if (!studio) {
      return NextResponse.json({ error: "找不到此工作室" }, { status: 404 });
    }

    if (!project || project.studioId !== studio.studioId) {
      return NextResponse.json({ error: "找不到此預約" }, { status: 404 });
    }

    if (!canClientAccessProject(project, client)) {
      return NextResponse.json({ error: "無權限修改此預約" }, { status: 403 });
    }

    if (!canClientEditProject(project)) {
      return NextResponse.json(
        { error: "預約已成立，無法再修改需求" },
        { status: 403 }
      );
    }

    if (intakeForm.isCoverUp && !studio.acceptsCoverUp) {
      return NextResponse.json(
        { error: "此工作室目前不接受蓋圖需求" },
        { status: 400 }
      );
    }

    if (
      !isValidAvailabilitySelection(intakeForm.availability, studio.operatingHours)
    ) {
      return NextResponse.json(
        { error: "所選時段不在工作室營業時間內" },
        { status: 400 }
      );
    }

    const tattooBrief = await generateTattooBrief(
      intakeForm as IntakeForm,
      resolveStudioLocale(studio)
    );

    await updateProjectIntake(
      projectId,
      intakeForm as IntakeForm,
      tattooBrief
    );

    return NextResponse.json({ projectId, tattooBrief });
  } catch (error) {
    console.error("Intake update failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "表單資料格式不正確" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "更新失敗，請稍後再試" },
      { status: 500 }
    );
  }
}
