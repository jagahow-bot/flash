import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudioStorefront } from "@/components/studio/studio-storefront";
import { getPreviewSessionFromCookies } from "@/lib/auth/preview-session";
import { getStudioBySlug } from "@/lib/firestore/studios.server";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";
import { getSiteUrl } from "@/lib/i18n/site-url";
import { applyProspectDefaultsToStudio } from "@/lib/studio/prospect-defaults";
import { resolveStudioLocale } from "@/lib/studio/resolve-studio-locale";

function buildStudioDescription(
  studio: { name: string; bio: string },
  fallback: string,
): string {
  const bio = studio.bio.trim();
  if (bio) return bio;
  return `${studio.name} — ${fallback}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ studioSlug: string }>;
}): Promise<Metadata> {
  const { studioSlug } = await params;
  const [studio, dict] = await Promise.all([
    getStudioBySlug(studioSlug),
    getAppDictionary(await getRequestLocale()),
  ]);

  if (!studio) {
    return {
      title: dict.booking.studioNotFound,
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/${studio.slug}`;
  const description = buildStudioDescription(
    studio,
    dict.booking.storefrontDescriptionFallback,
  );
  const title = `${studio.name} | FLASH`;
  const ogImageUrl = studio.logoUrl ?? `${siteUrl}/og/flash.svg`;
  const isPendingActivation = studio.lifecycleStatus === "pending_activation";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "FLASH",
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          alt: studio.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: !isPendingActivation,
      follow: !isPendingActivation,
    },
  };
}

export default async function StudioPage({
  params,
}: {
  params: Promise<{ studioSlug: string }>;
}) {
  const { studioSlug } = await params;
  const [rawStudio, previewSession] = await Promise.all([
    getStudioBySlug(studioSlug),
    getPreviewSessionFromCookies(),
  ]);

  if (!rawStudio) {
    notFound();
  }

  const locale = resolveStudioLocale(rawStudio);
  const studio =
    rawStudio.lifecycleStatus === "pending_activation"
      ? applyProspectDefaultsToStudio(rawStudio, locale)
      : rawStudio;

  const showPreviewBanner =
    rawStudio.lifecycleStatus === "pending_activation" &&
    previewSession?.studioId === rawStudio.studioId;

  return (
    <StudioStorefront
      studio={studio}
      showPreviewBanner={showPreviewBanner}
      showCareGuide={rawStudio.lifecycleStatus !== "pending_activation"}
    />
  );
}
