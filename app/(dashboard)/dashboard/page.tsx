import { redirect } from "next/navigation";
import { BookingPageLink } from "@/components/dashboard/booking-page-link";
import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace";
import { filterProjectsForStudioUser } from "@/lib/artists/access";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getArtistsByStudioId } from "@/lib/firestore/artists.server";
import { getStudioUnreadDiscussionCounts } from "@/lib/firestore/project-messages.server";
import { getProjectsByStudioId } from "@/lib/firestore/projects.server";
import { getStudioById } from "@/lib/firestore/studios.server";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";
import { getSiteUrl } from "@/lib/i18n/site-url";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user?.studioId) {
    redirect("/setup");
  }

  const [studio, artists, allProjects, dict] = await Promise.all([
    getStudioById(user.studioId),
    getArtistsByStudioId(user.studioId),
    getProjectsByStudioId(user.studioId),
    getAppDictionary(await getRequestLocale()),
  ]);

  const projects = filterProjectsForStudioUser(allProjects, user, artists);
  const unreadDiscussionCounts = await getStudioUnreadDiscussionCounts(projects);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">
          {studio?.name ?? dict.dashboard.titleFallback}
        </h1>
        <p className="text-muted-foreground">{dict.dashboard.subtitle}</p>
        {studio?.slug ? (
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
        studio={studio ?? undefined}
        closures={studio?.closures ?? []}
        canFilterArtists={user.role === "admin"}
        unreadDiscussionCounts={unreadDiscussionCounts}
      />
    </div>
  );
}
