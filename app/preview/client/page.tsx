import type { Metadata } from "next";
import { PreviewNav } from "@/components/preview/preview-nav";
import { PreviewReadonlyNotice } from "@/components/preview/preview-readonly-notice";
import { ProjectInboxCard } from "@/components/dashboard/project-inbox-card";
import { getProjectsByStudioId } from "@/lib/firestore/projects.server";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";
import { isDemoPreviewProject, requirePreviewStudio } from "@/lib/preview/access.server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getAppDictionary(await getRequestLocale());
  return {
    title: dict.preview.clientPickerTitle,
    robots: { index: false, follow: false },
  };
}

export default async function PreviewClientPickerPage() {
  const { studio } = await requirePreviewStudio();
  const [projects, dict] = await Promise.all([
    getProjectsByStudioId(studio.studioId),
    getAppDictionary(await getRequestLocale()),
  ]);

  const demoProjects = projects.filter(isDemoPreviewProject);
  const p = dict.preview;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <PreviewNav studioSlug={studio.slug} activeTab="client" />

      <PreviewReadonlyNotice />

      <div>
        <h1 className="text-2xl font-bold">{p.clientPickerTitle}</h1>
        <p className="text-muted-foreground">{p.clientPickerSubtitle}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{p.demoProjectsTitle}</CardTitle>
          <CardDescription>{p.demoProjectsDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {demoProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">{p.demoProjectsEmpty}</p>
          ) : (
            demoProjects.map((project) => (
              <ProjectInboxCard
                key={project.projectId}
                project={project}
                studio={studio}
                projectHref={`/preview/client/project/${project.projectId}`}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
