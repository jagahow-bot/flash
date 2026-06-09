import { redirect } from "next/navigation";
import { ClientProjectCard } from "@/components/client/client-project-card";
import { ClientSessionBar } from "@/components/client/client-session-bar";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { canActAsClient } from "@/lib/auth/user-roles";
import { getProjectsByClientId } from "@/lib/firestore/projects.server";
import { getStudioById } from "@/lib/firestore/studios.server";
import { getProjectMessages } from "@/lib/firestore/project-messages.server";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { countUnreadDiscussionMessages } from "@/lib/project/discussion-read";

function parseProjectDateFromId(projectId: string): number {
  const match = projectId.match(/-(\d{8})-\d+$/);
  if (!match) return 0;

  const y = Number(match[1].slice(0, 4));
  const m = Number(match[1].slice(4, 6)) - 1;
  const d = Number(match[1].slice(6, 8));
  const dt = new Date(y, m, d, 14, 0, 0, 0);

  return Number.isNaN(dt.getTime()) ? 0 : dt.getTime();
}

export default async function MyProjectsPage() {
  const user = await getAuthenticatedUser();
  const redirectTo = `/client/my-projects`;

  if (!user || !canActAsClient(user)) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  const projects = await getProjectsByClientId(user.uid);
  const sorted = [...projects].sort(
    (a, b) => parseProjectDateFromId(b.projectId) - parseProjectDateFromId(a.projectId)
  );

  const uniqueStudioIds = [...new Set(sorted.map((project) => project.studioId))];
  const studios = await Promise.all(uniqueStudioIds.map((id) => getStudioById(id)));
  const studioById = new Map(
    studios
      .filter((studio): studio is NonNullable<typeof studio> => Boolean(studio))
      .map((studio) => [studio.studioId, studio])
  );

  const projectsWithMeta = await Promise.all(
    sorted.map(async (project) => {
      const messages = await getProjectMessages(project.projectId);
      const unread = countUnreadDiscussionMessages(messages, "client", project);

      return {
        project,
        unread,
        studio: studioById.get(project.studioId) ?? null,
      };
    })
  );

  const dict = await getAppDictionary(await getRequestLocale());

  const visibleProjects = projectsWithMeta.filter((entry) => entry.studio);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {dict.clientPortal.myProjects}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dict.clientPortal.myProjectsDescription}
        </p>
      </div>

      <ClientSessionBar email={user.email} />

      {visibleProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
          <p className="font-medium">{dict.clientPortal.noProjects}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {dict.clientPortal.noProjectsHint}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleProjects.map(({ project, unread, studio }) => (
            <ClientProjectCard
              key={project.projectId}
              project={project}
              studioName={studio!.name}
              studioSlug={studio!.slug}
              unreadCount={unread}
            />
          ))}
        </div>
      )}
    </main>
  );
}
