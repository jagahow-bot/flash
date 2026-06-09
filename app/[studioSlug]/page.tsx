import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudioBySlug } from "@/lib/firestore/studios.server";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";
import { getSiteUrl } from "@/lib/i18n/site-url";
import { StudioBrandHeader } from "@/components/studio/studio-brand-header";
import { StudioSocialLinks } from "@/components/studio/studio-social-links";
import { Button } from "@/components/ui/button";

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
      index: true,
      follow: true,
    },
  };
}

export default async function StudioPage({
  params,
}: {
  params: Promise<{ studioSlug: string }>;
}) {
  const { studioSlug } = await params;
  const [studio, dict] = await Promise.all([
    getStudioBySlug(studioSlug),
    getAppDictionary(await getRequestLocale()),
  ]);

  if (!studio) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-8 text-center sm:gap-8 sm:py-16">
        <StudioBrandHeader
          name={studio.name}
          bio={studio.bio}
          logoUrl={studio.logoUrl}
        />
        <StudioSocialLinks socialLinks={studio.socialLinks} />
        <Link href={`/${studio.slug}/book`}>
          <Button size="lg">{dict.booking.bookCta}</Button>
        </Link>
      </div>
    </main>
  );
}
