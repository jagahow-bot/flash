import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { buildClientLoginRedirectUrl } from "@/lib/auth/client-auth-url";
import { getProjectById } from "@/lib/firestore/projects.server";
import { getStudioBySlug } from "@/lib/firestore/studios.server";
import { ClientSessionBar } from "@/components/client/client-session-bar";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { canActAsClient } from "@/lib/auth/user-roles";
import { canClientAccessProject, isGuestClientProject } from "@/lib/project/client-access";
import { canClientEditProject } from "@/lib/project/client-intake-edit";
import { hasReusableSketches } from "@/lib/project/session-schedule";
import { FloatingDiscussionPanel } from "@/components/project/project-discussion";
import { StudioBrandHeader } from "@/components/studio/studio-brand-header";
import { ActionBanner } from "@/components/project/action-banner";
import { ClientPreSessionSignPanel } from "@/components/project/client-pre-session-sign-panel";
import { SessionHistoryPanel } from "@/components/project/session-history-panel";
import { ClientIntakeSummary } from "@/components/project/client-intake-summary";
import { IntakeImagesGallery } from "@/components/project/intake-images-gallery";
import { ProjectAssetsGallery } from "@/components/project/project-assets-gallery";
import { SketchTimeline } from "@/components/project/sketch-timeline";
import { getSketchRecords } from "@/lib/project/sketch-records";
import { ProjectTimeline } from "@/components/project/project-timeline";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ studioSlug: string; projectId: string }>;
}) {
  const { studioSlug, projectId } = await params;
  const [studio, project, user, dict] = await Promise.all([
    getStudioBySlug(studioSlug),
    getProjectById(projectId),
    getAuthenticatedUser(),
    getAppDictionary(await getRequestLocale()),
  ]);
  const p = dict.project;
  const cp = dict.clientPortal;

  if (!studio || !project || project.studioId !== studio.studioId) {
    notFound();
  }

  if (!canClientAccessProject(project, user)) {
    redirect(
      buildClientLoginRedirectUrl(
        studioSlug,
        `/${studioSlug}/p/${projectId}`
      )
    );
  }

  const canEdit = canClientEditProject(project);
  const isGuest = isGuestClientProject(project);

  const showSessionBar =
    user && canActAsClient(user) && !isGuestClientProject(project);
  const showSketchReuseNote = hasReusableSketches(project);
  const sketchRecords = getSketchRecords(project);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6">
      {showSessionBar ? <ClientSessionBar email={user.email} /> : null}

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
        {isGuest ? p.guestBookmarkHint : p.loggedInBookmarkHint}
      </p>

      <ActionBanner
        project={project}
        studio={studio}
        studioSlug={studioSlug}
      />

      <ClientPreSessionSignPanel
        project={project}
        studio={studio}
        studioSlug={studioSlug}
      />

      <SessionHistoryPanel project={project} audience="client" />

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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{cp.intakeTitle}</CardTitle>
              <CardDescription className="mt-1.5">
                {canEdit ? p.intakeEditableDescription : p.intakeLockedDescription}
              </CardDescription>
            </div>
            {canEdit && (
              <Link
                href={`/${studioSlug}/p/${projectId}/edit`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "shrink-0"
                )}
              >
                {p.editIntake}
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <ClientIntakeSummary intakeForm={project.intakeForm} />
          <IntakeImagesGallery intakeForm={project.intakeForm} />
        </CardContent>
      </Card>

      <FloatingDiscussionPanel
        projectId={project.projectId}
        mode="client"
        intakeEditHref={`/${studioSlug}/p/${projectId}/edit`}
        showIntakeRevisionHint={project.pendingIntakeRevision}
      />
    </main>
  );
}
