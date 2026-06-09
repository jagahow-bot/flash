import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateTattooBrief } from "@/lib/ai/generate-brief";
import { FLASH_PRODUCT } from "@/lib/branding";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import type { IntakeForm } from "@/types/intake-form";
import { BUDGET_CURRENCIES, SIZE_UNITS } from "@/types/intake-form";

const requestSchema = z.object({
  intakeForm: z.object({
    placement: z.string(),
    size: z.string(),
    sizeUnit: z.enum(SIZE_UNITS).optional(),
    style: z.string(),
    description: z.string(),
    isCoverUp: z.boolean(),
    budget: z.string(),
    budgetCurrency: z.enum(BUDGET_CURRENCIES).optional(),
    availability: z.array(z.string()),
    notes: z.string(),
    placementPhotoUrl: z.string().optional(),
    referenceUrls: z.array(z.string()).optional(),
  }),
  locale: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intakeForm, locale: rawLocale } = requestSchema.parse(body);
    const locale =
      rawLocale && isLocale(rawLocale) ? rawLocale : defaultLocale;

    const tattooBrief = await generateTattooBrief(
      intakeForm as IntakeForm,
      locale
    );

    return NextResponse.json({ tattooBrief });
  } catch (error) {
    console.error("Generate brief failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "表單資料格式不正確" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `${FLASH_PRODUCT} 處理失敗，請稍後再試` },
      { status: 500 }
    );
  }
}
