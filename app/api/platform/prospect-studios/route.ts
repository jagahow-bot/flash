import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorizePlatformImport } from "@/lib/auth/authorize-platform-import";
import { sendStudioOutreachEmail } from "@/lib/email/studio-outreach.server";
import { createProspectStudio } from "@/lib/firestore/prospect-studios.server";
import { locales } from "@/lib/i18n/config";
import { localeFromCountry } from "@/lib/platform/country-locale";
import { normalizeStudioSocialLinks } from "@/lib/studio/social-links";

const socialLinksSchema = z
  .object({
    instagram: z.string().max(200).optional(),
    facebook: z.string().max(500).optional(),
    line: z.string().max(200).optional(),
    threads: z.string().max(200).optional(),
  })
  .optional();

const schema = z.object({
  prospectEmail: z.string().email().optional(),
  email: z.string().email().optional(),
  name: z.string().min(1).max(120),
  slug: z.string().min(2).max(48).optional(),
  bio: z.string().max(2000).optional(),
  preferredLocale: z.enum(locales).optional(),
  country: z.string().min(2).max(8).optional(),
  isSoloStudio: z.boolean().optional(),
  sendEmail: z.boolean().optional(),
  socialLinks: socialLinksSchema,
  instagram: z.string().max(200).optional(),
  facebook: z.string().max(500).optional(),
  line: z.string().max(200).optional(),
  threads: z.string().max(200).optional(),
  logoUrl: z.string().url().optional(),
  flashImageUrls: z.array(z.string().url()).max(12).optional(),
  artistNames: z.array(z.string().min(1).max(80)).max(20).optional(),
  acceptsCoverUp: z.boolean().optional(),
});

function buildSocialLinks(
  data: z.infer<typeof schema>,
): ReturnType<typeof normalizeStudioSocialLinks> {
  const merged = {
    instagram: data.socialLinks?.instagram ?? data.instagram,
    facebook: data.socialLinks?.facebook ?? data.facebook,
    line: data.socialLinks?.line ?? data.line,
    threads: data.socialLinks?.threads ?? data.threads,
  };

  return normalizeStudioSocialLinks(merged);
}

export async function POST(request: NextRequest) {
  const user = await authorizePlatformImport(request);
  if (!user) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = schema.parse(body);
    const prospectEmail = data.prospectEmail ?? data.email;

    if (!prospectEmail) {
      return NextResponse.json(
        { error: "請提供 prospectEmail 或 email" },
        { status: 400 },
      );
    }

    const preferredLocale =
      data.preferredLocale ?? localeFromCountry(data.country);
    const socialLinks = buildSocialLinks(data);

    const result = await createProspectStudio({
      prospectEmail,
      name: data.name,
      slug: data.slug,
      bio: data.bio,
      preferredLocale,
      isSoloStudio: data.isSoloStudio,
      acceptsCoverUp: data.acceptsCoverUp,
      artistNames: data.artistNames,
      socialLinks,
      logoUrl: data.logoUrl,
      flashImageUrls: data.flashImageUrls,
      country: data.country,
    });

    if (data.sendEmail) {
      void sendStudioOutreachEmail({
        email: prospectEmail,
        studioName: result.studio.name,
        studioSlug: result.studio.slug,
        claimUrl: result.claimUrl,
        locale: result.studio.preferredLocale ?? "zh-Hant",
      });
    }

    return NextResponse.json({
      studioId: result.studio.studioId,
      slug: result.studio.slug,
      claimUrl: result.claimUrl,
      storefrontUrl: result.storefrontUrl,
      status: result.studio.lifecycleStatus ?? "pending_activation",
      demoProjectIds: result.demoProjects.map((project) => project.projectId),
      emailQueued: Boolean(data.sendEmail),
    });
  } catch (error) {
    console.error("Create prospect studio failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "請求格式不正確", details: error.flatten() },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      if (error.message === "INVALID_SLUG") {
        return NextResponse.json({ error: "預約網址格式不正確" }, { status: 400 });
      }
      if (error.message === "SLUG_TAKEN") {
        return NextResponse.json({ error: "此預約網址已被使用" }, { status: 409 });
      }
      if (error.message === "INVALID_EMAIL") {
        return NextResponse.json({ error: "Email 格式不正確" }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "建立失敗，請稍後再試" }, { status: 500 });
  }
}
