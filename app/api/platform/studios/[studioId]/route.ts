import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePlatformAdmin } from "@/lib/auth/require-platform-admin";
import {
  findStudioById,
  getPlatformStudioSummary,
} from "@/lib/firestore/platform-studios.server";
import { updateStudioFields } from "@/lib/firestore/studios.server";

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .nullable();

const studioPatchSchema = z.object({
  promoFreeUntil: isoDateSchema,
  billingExemptUntil: isoDateSchema,
  freeBookingsRemaining: z.coerce.number().int().min(0).optional(),
  platformBillingTier: z.enum(["free", "paid", "trial"]).optional(),
  billingStatus: z.enum(["active", "past_due", "suspended"]).optional(),
  platformNotes: z.string().max(2000).optional().nullable(),
});

function formatZodDetails(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "body";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ studioId: string }> }
) {
  const user = await requirePlatformAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studioId } = await context.params;
  const id = studioId.trim();
  if (!id) {
    return NextResponse.json({ error: "Studio id is required" }, { status: 400 });
  }

  const studio = await getPlatformStudioSummary(id);

  if (!studio) {
    return NextResponse.json({ error: "Studio not found" }, { status: 404 });
  }

  return NextResponse.json({ studio });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ studioId: string }> }
) {
  const user = await requirePlatformAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studioId } = await context.params;
  const id = studioId.trim();
  if (!id) {
    return NextResponse.json({ error: "Studio id is required" }, { status: 400 });
  }

  try {
    const existing = await findStudioById(id);
    if (!existing) {
      return NextResponse.json({ error: "Studio not found" }, { status: 404 });
    }

    const body = await request.json();
    const updates = studioPatchSchema.parse(body);

    await updateStudioFields(id, {
      ...(updates.promoFreeUntil !== undefined && {
        promoFreeUntil: updates.promoFreeUntil,
      }),
      ...(updates.billingExemptUntil !== undefined && {
        billingExemptUntil: updates.billingExemptUntil,
      }),
      ...(updates.freeBookingsRemaining !== undefined && {
        freeBookingsRemaining: updates.freeBookingsRemaining,
      }),
      ...(updates.platformBillingTier !== undefined && {
        platformBillingTier: updates.platformBillingTier,
      }),
      ...(updates.billingStatus !== undefined && {
        billingStatus: updates.billingStatus,
      }),
      ...(updates.platformNotes !== undefined && {
        platformNotes: updates.platformNotes,
      }),
    });

    const studio = await getPlatformStudioSummary(id);
    if (!studio) {
      return NextResponse.json(
        { error: "Studio updated but summary could not be reloaded" },
        { status: 500 }
      );
    }

    return NextResponse.json({ studio });
  } catch (error) {
    console.error("Failed to update platform studio:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: formatZodDetails(error),
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Studio not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update studio",
      },
      { status: 500 }
    );
  }
}
