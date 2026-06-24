import type { Metadata } from "next";
import { BookingPageLink } from "@/components/dashboard/booking-page-link";
import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace";
import { PreviewActivateBanner } from "@/components/preview/preview-activate-banner";
import { PreviewNav } from "@/components/preview/preview-nav";
import { PreviewReadonlyNotice } from "@/components/preview/preview-readonly-notice";
import { getProjectsByStudioId } from "@/lib/firestore/projects.server";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";
import { getSiteUrl } from "@/lib/i18n/site-url";
import { requirePreviewStudio } from "@/lib/preview/access.server";
import { buildProspectArtists } from "@/lib/studio/prospect-artists";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getAppDictionary(await getRequestLocale());
  return {
    title: dict.preview.title,
    robots: { index: false, follow: false },
  };
}

export default async function PreviewDashboardPage() {
  const { preview, studio } = await requirePreviewStudio();

  const [projects, dict] = await Promise.all([
    getProjectsByStudioId(studio.studioId),
    getAppDictionary(await getRequestLocale()),
  ]);

  const p = dict.preview;
  const artists = buildProspectArtists(studio);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <PreviewNav studioSlug={studio.slug} activeTab="dashboard" />

      <PreviewReadonlyNotice />

      <PreviewActivateBanner email={preview.email} studioName={studio.name} />

      <div>
        <h1 className="text-2xl font-bold">
          {studio.name} — {p.dashboardTitle}
        </h1>
        <p className="text-muted-foreground">{p.dashboardSubtitle}</p>
        {studio.slug ? (
          <BookingPageLink
            studioSlug={studio.slug}
            siteUrl={getSiteUrl()}
            label={dict.dashboard.bookingPageLink}
          />
        ) : null}
      </div>

      <DashboardWorkspace
        projects={projects}
        artists={artists}
        studio={studio}
        closures={studio.closures ?? []}
        canFilterArtists={artists.length > 1}
        readonly
        projectHrefPrefix="/preview/projects"
      />
    </div>
  );
}
