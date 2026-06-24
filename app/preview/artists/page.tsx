import type { Metadata } from "next";
import { ArtistManagement } from "@/components/settings/artist-management";
import { PreviewActivateBanner } from "@/components/preview/preview-activate-banner";
import { PreviewNav } from "@/components/preview/preview-nav";
import { PreviewReadonlyNotice } from "@/components/preview/preview-readonly-notice";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";
import { requirePreviewStudio } from "@/lib/preview/access.server";
import { buildProspectArtists } from "@/lib/studio/prospect-artists";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getAppDictionary(await getRequestLocale());
  return {
    title: dict.artists.pageTitle,
    robots: { index: false, follow: false },
  };
}

export default async function PreviewArtistsPage() {
  const { preview, studio } = await requirePreviewStudio();
  const dict = await getAppDictionary(await getRequestLocale());
  const a = dict.artists;
  const artists = buildProspectArtists(studio);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <PreviewNav studioSlug={studio.slug} activeTab="artists" />

      <PreviewReadonlyNotice />

      <PreviewActivateBanner email={preview.email} studioName={studio.name} />

      <div>
        <h1 className="text-2xl font-bold">{a.pageTitle}</h1>
        <p className="text-muted-foreground">{a.pageSubtitle}</p>
      </div>

      <ArtistManagement
        studio={studio}
        artists={artists}
        adminEmail={preview.email}
        readOnly
      />
    </div>
  );
}
