import { notFound, redirect } from "next/navigation";
import {
  getPreviewSessionFromCookies,
  type PreviewSessionPayload,
} from "@/lib/auth/preview-session";
import { getProjectById } from "@/lib/firestore/projects.server";
import { getStudioById } from "@/lib/firestore/studios.server";
import type { Project } from "@/types/project";
import type { Studio } from "@/types/studio";

export function isDemoPreviewProject(project: Project): boolean {
  return project.clientId.startsWith("demo-client");
}

export async function requirePreviewStudio(): Promise<{
  preview: PreviewSessionPayload;
  studio: Studio;
}> {
  const preview = await getPreviewSessionFromCookies();
  if (!preview) {
    redirect("/claim");
  }

  const studio = await getStudioById(preview.studioId);
  if (!studio || studio.lifecycleStatus !== "pending_activation") {
    redirect("/login");
  }

  return { preview, studio };
}

export async function requirePreviewProject(projectId: string): Promise<{
  preview: PreviewSessionPayload;
  studio: Studio;
  project: Project;
}> {
  const { preview, studio } = await requirePreviewStudio();
  const project = await getProjectById(projectId);

  if (
    !project ||
    project.studioId !== studio.studioId ||
    !isDemoPreviewProject(project)
  ) {
    notFound();
  }

  return { preview, studio, project };
}
