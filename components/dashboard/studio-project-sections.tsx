"use client";

import Link from "next/link";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { DepositAwaitingPanel } from "@/components/dashboard/deposit-awaiting-panel";
import { DepositReviewPanel } from "@/components/dashboard/deposit-review-panel";
import { PreSessionDocumentsPanel } from "@/components/dashboard/pre-session-documents-panel";
import { ProjectAssetsPanel } from "@/components/dashboard/project-assets-panel";
import { ProjectQuoteForm } from "@/components/dashboard/project-quote-form";
import { TattooBriefPanel } from "@/components/dashboard/tattoo-brief-panel";
import { ClientPortalLink } from "@/components/project/client-portal-link";
import { ClientIntakeSummary } from "@/components/project/client-intake-summary";
import { IntakeImagesGallery } from "@/components/project/intake-images-gallery";
import { ProjectAssetsGallery } from "@/components/project/project-assets-gallery";
import { SketchTimeline } from "@/components/project/sketch-timeline";
import { getSketchRecords } from "@/lib/project/sketch-records";
import { SessionHistoryPanel } from "@/components/project/session-history-panel";
import {
  hasPendingInPersonDocuments,
} from "@/lib/pre-session-documents/records";
import {
  getStudioProjectLayout,
  STUDIO_ZONE_MARKERS,
  type StudioLayoutZone,
  type StudioSection,
} from "@/lib/project/studio-layout";
import type { Artist } from "@/types/artist";
import type { Project } from "@/types/project";
import type { Studio } from "@/types/studio";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StudioProjectSectionsProps {
  project: Project;
  studio: Studio;
  artists: Artist[];
  studioProjects: Project[];
  canAssignArtist: boolean;
  lockedArtistId?: string;
  readOnly?: boolean;
  clientPreviewHref?: string;
}

function StudioZoneHeading({
  zone,
  labels,
}: {
  zone: StudioLayoutZone;
  labels: Record<StudioLayoutZone, string>;
}) {
  return (
    <div
      className={
        zone === "reference"
          ? "border-t border-border/60 pt-6"
          : "border-b border-border/60 pb-2"
      }
    >
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span aria-hidden="true" className="mr-1.5">
          {STUDIO_ZONE_MARKERS[zone]}
        </span>
        {labels[zone]}
      </h2>
    </div>
  );
}

export function StudioProjectSections({
  project,
  studio,
  artists,
  studioProjects,
  canAssignArtist,
  lockedArtistId,
  readOnly = false,
  clientPreviewHref,
}: StudioProjectSectionsProps) {
  const d = useAppDictionary().dashboard;
  const projectDict = useAppDictionary().project;
  const assetsDict = useAppDictionary().assets;
  const zoneLabels: Record<StudioLayoutZone, string> = {
    action: d.zoneAction,
    collaboration: d.zoneCollaboration,
    reference: d.zoneReference,
  };
  const p = useAppDictionary().preview;
  const layout = getStudioProjectLayout(project, studio);
  const sketchRecords = getSketchRecords(project);

  function renderSection(section: StudioSection, zone: StudioLayoutZone) {
    switch (section) {
      case "deposit_awaiting":
        return readOnly ? null : (
          <DepositAwaitingPanel key={section} project={project} studio={studio} />
        );
      case "deposit_review":
        return readOnly ? null : (
          <DepositReviewPanel key={section} project={project} studio={studio} />
        );
      case "quote_form":
        return (
          <ProjectQuoteForm
            key={section}
            project={project}
            studio={studio}
            artists={artists}
            studioProjects={studioProjects}
            canAssignArtist={canAssignArtist}
            lockedArtistId={lockedArtistId}
            forcedReadOnly={readOnly}
          />
        );
      case "assets":
        if (readOnly) {
          if (sketchRecords.length === 0 && project.finalPhotos.length === 0) {
            return null;
          }
          return (
            <Card key={section}>
              <CardHeader>
                <CardTitle>{projectDict.studioWorksTitle}</CardTitle>
                <CardDescription>{p.assetsReadonlyHint}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {sketchRecords.length > 0 ? (
                  <SketchTimeline
                    records={sketchRecords}
                    title={projectDict.sketchHistory}
                    mode="studio"
                  />
                ) : null}
                {project.finalPhotos.length > 0 ? (
                  <ProjectAssetsGallery
                    title={assetsDict.finalPhotoAfter}
                    urls={project.finalPhotos}
                    variant="large"
                  />
                ) : null}
              </CardContent>
            </Card>
          );
        }
        return (
          <ProjectAssetsPanel
            key={section}
            project={project}
            studioId={studio.studioId}
          />
        );
      case "brief":
        return <TattooBriefPanel key={section} brief={project.tattooBrief} />;
      case "intake":
        return (
          <Card key={section}>
            <CardHeader>
              <CardTitle>{d.clientIntakeTitle}</CardTitle>
              <CardDescription>{d.clientIntakeDescription}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <ClientIntakeSummary intakeForm={project.intakeForm} />
              <IntakeImagesGallery intakeForm={project.intakeForm} />
            </CardContent>
          </Card>
        );
      case "session_history":
        return (
          <SessionHistoryPanel
            key={section}
            project={project}
            studio={studio}
            audience="studio"
          />
        );
      case "portal_link":
        if (readOnly && clientPreviewHref) {
          return (
            <Card key={section}>
              <CardHeader>
                <CardTitle>{p.clientPreviewLinkTitle}</CardTitle>
                <CardDescription>{p.clientPreviewLinkDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={clientPreviewHref}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {p.openClientPreview}
                </Link>
              </CardContent>
            </Card>
          );
        }
        if (readOnly) {
          return null;
        }
        return (
          <ClientPortalLink
            key={section}
            studioSlug={studio.slug}
            projectId={project.projectId}
          />
        );
      case "pre_session_documents":
        if (readOnly) {
          return null;
        }
        return (
          <PreSessionDocumentsPanel
            key={`${section}-${zone}`}
            project={project}
            studio={studio}
            variant={
              zone === "action" && hasPendingInPersonDocuments(project, studio)
                ? "action"
                : "archive"
            }
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {layout.map((group) => (
        <section key={group.zone} className="flex flex-col gap-4">
          <StudioZoneHeading zone={group.zone} labels={zoneLabels} />
          <div className="flex flex-col gap-6">
            {group.sections.map((section) =>
              renderSection(section, group.zone)
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
