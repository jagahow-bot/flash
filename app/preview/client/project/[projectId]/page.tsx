import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PreviewNav } from "@/components/preview/preview-nav";
import { PreviewReadonlyNotice } from "@/components/preview/preview-readonly-notice";
import { StudioBrandHeader } from "@/components/studio/studio-brand-header";
import { ActionBanner } from "@/components/project/action-banner";
import { ClientIntakeSummary } from "@/components/project/client-intake-summary";
import { IntakeImagesGallery } from "@/components/project/intake-images-gallery";
import { ProjectAssetsGallery } from "@/components/project/project-assets-gallery";
import { ProjectTimeline } from "@/components/project/project-timeline";
import { SessionHistoryPanel } from "@/components/project/session-history-panel";
import { SketchTimeline } from "@/components/project/sketch-timeline";
import { getSketchRecords } from "@/lib/project/sketch-records";
import { hasReusableSketches } from "@/lib/project/session-schedule";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";
import { requirePreviewProject } from "@/lib/preview/access.server";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  const dict = await getAppDictionary(await getRequestLocale());
  return {
    title: dict.preview.clientViewTitle,
    robots: { index: false, follow: false },
  };
}

export default async function PreviewClientProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { studio, project } = await requirePreviewProject(projectId);
  const dict = await getAppDictionary(await getRequestLocale());
  const p = dict.project;
  const cp = dict.clientPortal;
  const preview = dict.preview;
  const sketchRecords = getSketchRecords(project);
  const showSketchReuseNote = hasReusableSketches(project);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      <PreviewNav
        studioSlug={studio.slug}
        activeTab="client"
        clientProjectId={project.projectId}
      />

      <PreviewReadonlyNotice />

      <Link
        href={`/preview/projects/${project.projectId}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 w-fit")}
      >
        <ArrowLeft className="size-4" />
        {preview.backToStudioView}
      </Link>

      <StudioBrandHeader
        name={studio.name}
        logoUrl={studio.logoUrl}
        eyebrow={cp.myProjects}
      />
      <p className="-mt-4 text-center text-sm text-muted-foreground">
        {p.projectCodePrefix}
        {projectId}
      </p>
      <p className="text-center text-xs text-muted-foreground">
        {preview.clientViewHint}
      </p>

      <ActionBanner
        project={project}
        studio={studio}
        studioSlug={studio.slug}
        previewMode
      />

      <SessionHistoryPanel project={project} studio={studio} audience="client" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{p.progressTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectTimeline project={project} />
        </CardContent>
      </Card>

      {(project.sketches.length > 0 || project.finalPhotos.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{p.studioWorksTitle}</CardTitle>
            <CardDescription>{p.studioWorksDescription}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <SketchTimeline
                records={sketchRecords}
                title={p.sketchHistory}
                mode="client"
              />
              {showSketchReuseNote && (
                <p className="text-sm text-muted-foreground">
                  {p.sketchReuseNote}
                </p>
              )}
            </div>
            <ProjectAssetsGallery
              title={dict.assets.finalPhotoAfter}
              urls={project.finalPhotos}
              variant="large"
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{cp.intakeTitle}</CardTitle>
          <CardDescription>{p.intakeLockedDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <ClientIntakeSummary intakeForm={project.intakeForm} />
          <IntakeImagesGallery intakeForm={project.intakeForm} />
        </CardContent>
      </Card>
    </main>
  );
}
