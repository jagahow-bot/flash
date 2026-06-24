import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  extractStudioProfileFromRawBundle,
  type StudioRawBundle,
} from "@/lib/ai/extract-studio-profile";
import { authorizePlatformImport } from "@/lib/auth/authorize-platform-import";

const rawBundleSchema: z.ZodType<StudioRawBundle> = z.object({
  googleMaps: z
    .object({
      name: z.string().optional(),
      formattedAddress: z.string().optional(),
      phone: z.string().optional(),
      website: z.string().optional(),
      openingHours: z.array(z.string()).optional(),
      rating: z.number().optional(),
    })
    .optional(),
  website: z
    .object({
      pages: z
        .array(
          z.object({
            url: z.string().optional(),
            text: z.string().optional(),
          }),
        )
        .optional(),
    })
    .optional(),
  social: z
    .object({
      instagram: z
        .object({
          handle: z.string().optional(),
          bio: z.string().optional(),
          captions: z.array(z.string()).optional(),
        })
        .optional(),
      facebook: z
        .object({
          url: z.string().optional(),
          about: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  scrapedContact: z
    .object({
      email: z.string().optional(),
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      line: z.string().optional(),
      website: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
  notes: z.string().optional(),
});

const schema = z.object({
  rawBundle: rawBundleSchema,
  country: z.string().min(2).max(8).optional(),
});

export async function POST(request: NextRequest) {
  const user = await authorizePlatformImport(request);
  if (!user) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { rawBundle } = schema.parse(body);
    const profile = await extractStudioProfileFromRawBundle(rawBundle);

    return NextResponse.json({
      profile,
      scrapedStudio: {
        name: profile.name,
        bio: profile.bio,
        artistNames: profile.artistNames,
        isSoloStudio: profile.isSoloStudio ?? undefined,
        acceptsCoverUp: profile.acceptsCoverUp ?? undefined,
        instagram: profile.instagram,
        facebook: profile.facebook,
        line: profile.line,
        threads: profile.threads,
        logoUrl: profile.logoUrl,
        flashImageUrls: profile.flashImageUrls,
        extractionNotes: profile.extractionNotes,
      },
    });
  } catch (error) {
    console.error("Enrich studio failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "請求格式不正確", details: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "AI 萃取失敗，請稍後再試" },
      { status: 500 },
    );
  }
}
