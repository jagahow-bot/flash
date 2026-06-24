import type { Metadata } from "next";
import { FlashDesignsManager } from "@/components/settings/flash-designs-manager";
import { StudioSettingsForm } from "@/components/settings/studio-settings-form";
import { PreviewActivateBanner } from "@/components/preview/preview-activate-banner";
import { PreviewNav } from "@/components/preview/preview-nav";
import { PreviewReadonlyNotice } from "@/components/preview/preview-readonly-notice";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";
import { requirePreviewStudio } from "@/lib/preview/access.server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getAppDictionary(await getRequestLocale());
  return {
    title: dict.settings.pageTitle,
    robots: { index: false, follow: false },
  };
}

export default async function PreviewSettingsPage() {
  const { preview, studio } = await requirePreviewStudio();
  const dict = await getAppDictionary(await getRequestLocale());
  const s = dict.settings;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <PreviewNav studioSlug={studio.slug} activeTab="settings" />

      <PreviewReadonlyNotice />

      <PreviewActivateBanner email={preview.email} studioName={studio.name} />

      <div>
        <h1 className="text-2xl font-bold">{s.pageTitle}</h1>
        <p className="text-muted-foreground">{s.pageSubtitle}</p>
      </div>

      <FlashDesignsManager studio={studio} readOnly />
      <StudioSettingsForm studio={studio} readOnly />
    </div>
  );
}
