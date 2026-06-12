import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { buildClientLoginRedirectUrl } from "@/lib/auth/client-auth-url";
import { ClientSessionBar } from "@/components/client/client-session-bar";
import { IntakeForm } from "@/components/intake/intake-form";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { canActAsClient } from "@/lib/auth/user-roles";
import { getProjectById } from "@/lib/firestore/projects.server";
import { getStudioBySlug } from "@/lib/firestore/studios.server";
import { canClientAccessProject } from "@/lib/project/client-access";
import { canClientEditProject } from "@/lib/project/client-intake-edit";
import { buttonVariants } from "@/components/ui/button";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";

export default async function EditProjectIntakePage({
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
  const b = dict.booking;

  if (!studio || !project || project.studioId !== studio.studioId) {
    notFound();
  }

  if (!canClientAccessProject(project, user)) {
    redirect(
      buildClientLoginRedirectUrl(
        studioSlug,
        `/${studioSlug}/p/${projectId}/edit`
      )
    );
  }

  if (!canClientEditProject(project)) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-4 py-10 text-center">
        <h1 className="text-2xl font-bold">{p.cannotEditTitle}</h1>
        <p className="text-muted-foreground">{p.cannotEditDescription}</p>
        <Link
          href={`/${studioSlug}/p/${projectId}`}
          className={buttonVariants()}
        >
          {p.backToProject}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{b.formTitleEdit}</p>
        <h1 className="text-3xl font-bold">{studio.name}</h1>
        <p className="mt-2 text-muted-foreground">
          {p.projectCodePrefix}
          {projectId}
        </p>
      </div>
      <IntakeForm
        studio={studio}
        projectId={projectId}
        initialIntake={project.intakeForm}
      />
    </main>
  );
}
