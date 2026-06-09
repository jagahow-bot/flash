import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProjectOverviewHeader } from "@/components/dashboard/project-overview-header";
import { StudioProjectSections } from "@/components/dashboard/studio-project-sections";
import { FloatingDiscussionPanel } from "@/components/project/project-discussion";
import { getLinkedArtist } from "@/lib/artists/access";
import { getArtistDisplayName } from "@/lib/artists/lookup";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getArtistsByStudioId } from "@/lib/firestore/artists.server";
import { getProjectsByStudioId, getProjectById } from "@/lib/firestore/projects.server";
import { getUserById } from "@/lib/firestore/users.server";
import { getStudioById } from "@/lib/firestore/studios.server";
import { isGuestClientProject } from "@/lib/project/client-access";
import { buttonVariants } from "@/components/ui/button";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";
import { cn } from "@/lib/utils";

export default async function DashboardProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const user = await getAuthenticatedUser();

  if (!user?.studioId) {
    redirect("/setup");
  }

  const { projectId } = await params;
  const [project, studio, artists, studioProjects, dict] = await Promise.all([
    getProjectById(projectId),
    getStudioById(user.studioId),
    getArtistsByStudioId(user.studioId),
    getProjectsByStudioId(user.studioId),
    getAppDictionary(await getRequestLocale()),
  ]);

  const clientUser = project
    ? isGuestClientProject(project)
      ? null
      : await getUserById(project.clientId)
    : null;

  if (!project || project.studioId !== user.studioId || !studio) {
    notFound();
  }

  const linkedArtist = getLinkedArtist(artists, user);
  if (
    user.role === "artist" &&
    linkedArtist &&
    project.artistId &&
    project.artistId !== linkedArtist.artistId
  ) {
    notFound();
  }

  const artistName = getArtistDisplayName(project.artistId, artists);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <Link
        href="/dashboard"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "-ml-2 w-fit"
        )}
      >
        <ArrowLeft className="size-4" />
        {dict.auth.backToHome}
      </Link>

      <ProjectOverviewHeader
        project={project}
        artistName={artistName}
        clientUser={clientUser}
      />

      <StudioProjectSections
        project={project}
        studio={studio}
        artists={artists}
        studioProjects={studioProjects}
        canAssignArtist={user.role === "admin"}
        lockedArtistId={linkedArtist?.artistId}
      />

      <FloatingDiscussionPanel
        projectId={project.projectId}
        mode="studio"
      />
    </div>
  );
}
