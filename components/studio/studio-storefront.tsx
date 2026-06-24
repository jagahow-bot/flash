import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { StudioBrandHeader } from "@/components/studio/studio-brand-header";
import { StudioSocialLinks } from "@/components/studio/studio-social-links";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getFlashDesignsByStudioId, resolveFlashDesignPrice } from "@/lib/firestore/flash-designs.server";
import { toPublicImageSrc } from "@/lib/images/public-src";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";
import { formatStudioPrice } from "@/lib/project/format";
import type { Studio } from "@/types/studio";

function truncateText(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

interface StudioStorefrontProps {
  studio: Studio;
  showPreviewBanner?: boolean;
  showCareGuide?: boolean;
}

export async function StudioStorefront({
  studio,
  showPreviewBanner = false,
  showCareGuide = true,
}: StudioStorefrontProps) {
  const dict = await getAppDictionary(await getRequestLocale());
  const p = dict.preview;
  const b = dict.booking;
  const f = dict.flash;

  const flashDesigns =
    studio.flashBookingEnabled !== false
      ? await getFlashDesignsByStudioId(studio.studioId, { activeOnly: true })
      : [];

  const careGuideSnippet =
    showCareGuide && studio.careGuide.trim()
      ? truncateText(studio.careGuide, 280)
      : null;

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:gap-10 sm:py-14">
        {showPreviewBanner ? (
          <div className="rounded-lg border border-amber-300/80 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
            <p className="font-medium">{p.storefrontBannerTitle}</p>
            <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">
              {p.storefrontBannerBody}
            </p>
          </div>
        ) : null}

        <StudioBrandHeader
          name={studio.name}
          bio={studio.bio}
          logoUrl={studio.logoUrl}
        />

        <StudioSocialLinks socialLinks={studio.socialLinks} />

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href={`/${studio.slug}/book`}>
            <Button size="lg">{b.bookCta}</Button>
          </Link>
          {showPreviewBanner ? (
            <Link href="/preview/dashboard">
              <Button size="lg" variant="outline">
                {p.viewDashboardPreview}
              </Button>
            </Link>
          ) : null}
        </div>

        {careGuideSnippet ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{p.careGuideTitle}</CardTitle>
              <CardDescription>{p.careGuideSnippetHint}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {careGuideSnippet}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {flashDesigns.length > 0 ? (
          <section className="flex flex-col gap-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Sparkles className="size-4" />
                {f.storefrontSectionTitle}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {f.storefrontSectionDescription}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {flashDesigns.map((design) => {
                const price = resolveFlashDesignPrice(
                  design,
                  studio.flashUniformPrice,
                );
                return (
                  <Card key={design.designId} className="overflow-hidden">
                    <div className="relative aspect-square bg-muted">
                      <Image
                        src={toPublicImageSrc(design.imageUrl)}
                        alt={design.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 320px"
                      />
                    </div>
                    <CardContent className="flex flex-col gap-1 p-4">
                      <p className="font-medium">{design.title}</p>
                      {price !== null ? (
                        <p className="text-sm text-muted-foreground">
                          {formatStudioPrice(price, studio, dict)}
                        </p>
                      ) : null}
                      {design.allowedSizes.length > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          {design.allowedSizes.join(" · ")}
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
