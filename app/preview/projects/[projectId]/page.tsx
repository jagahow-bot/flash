import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectOverviewHeader } from "@/components/dashboard/project-overview-header";
import { StudioProjectSections } from "@/components/dashboard/studio-project-sections";
import { PreviewNav } from "@/components/preview/preview-nav";
import { PreviewReadonlyNotice } from "@/components/preview/preview-readonly-notice";
import { PreviewActivateBanner } from "@/components/preview/preview-activate-banner";
import { buttonVariants } from "@/components/ui/button";
import { getProjectsByStudioId } from "@/lib/firestore/projects.server";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";
import { requirePreviewProject } from "@/lib/preview/access.server";
import { buildProspectArtists } from "@/lib/studio/prospect-artists";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  const dict = await getAppDictionary(await getRequestLocale());
  return {
    title: dict.preview.projectDetailTitle,
    robots: { index: false, follow: false },
  };
}

export default async function PreviewProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await requirePreviewProject(projectId);
  const { preview, studio, project } = session;

  const [studioProjects, dict] = await Promise.all([
    getProjectsByStudioId(studio.studioId),
    getAppDictionary(await getRequestLocale()),
  ]);

  const p = dict.preview;
  const artists = buildProspectArtists(studio);
  const assignedArtist = artists.find(
    (artist) => artist.artistId === project.artistId,
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <PreviewNav
        studioSlug={studio.slug}
        activeTab="dashboard"
        clientProjectId={project.projectId}
      />

      <PreviewReadonlyNotice />

      <PreviewActivateBanner email={preview.email} studioName={studio.name} />

      <Link
        href="/preview/dashboard"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 w-fit")}
      >
        <ArrowLeft className="size-4" />
        {p.backToDashboard}
      </Link>

      <div>
        <h1 className="text-2xl font-bold">
          {studio.name} — {p.projectDetailTitle}
        </h1>
        <p className="text-muted-foreground">{p.projectDetailSubtitle}</p>
      </div>

      <ProjectOverviewHeader
        project={project}
        studio={studio}
        artistName={assignedArtist?.displayName ?? null}
        clientUser={null}
        readOnly
      />

      <StudioProjectSections
        project={project}
        studio={studio}
        artists={artists}
        studioProjects={studioProjects}
        canAssignArtist={false}
        readOnly
        clientPreviewHref={`/preview/client/project/${project.projectId}`}
      />
    </div>
  );
}
