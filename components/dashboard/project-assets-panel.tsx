"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Camera, PenLine } from "lucide-react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { ImageUploadZone } from "@/components/intake/image-upload-zone";
import { formatMessage } from "@/lib/i18n/format";
import { compressImages } from "@/lib/storage/compress-image";
import {
  uploadProjectAsset,
  type ProjectAssetFolder,
} from "@/lib/storage/upload-project-asset";
import type { Project } from "@/types/project";
import { ProjectAssetsGallery } from "@/components/project/project-assets-gallery";
import { SketchTimeline } from "@/components/project/sketch-timeline";
import { getSketchRecords } from "@/lib/project/sketch-records";
import {
  canAdvanceToNextSessionDelivery,
  getBookedSessionCount,
  getCurrentSessionIndex,
  getTotalSessions,
  hasMoreSessionsToBook,
  hasReusableSketches,
  isAwaitingSessionDelivery,
  isMultiSession,
} from "@/lib/project/session-schedule";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function AssetSectionHeader({
  icon: Icon,
  title,
  subtitle,
  accentClassName,
}: {
  icon: typeof PenLine;
  title: string;
  subtitle: string;
  accentClassName: string;
}) {
  return (
    <div className="flex items-start gap-2.5 border-b border-border pb-3">
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md",
          accentClassName
        )}
      >
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold leading-none">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export function ProjectAssetsPanel({
  project,
  studioId,
}: {
  project: Project;
  studioId: string;
}) {
  const dict = useAppDictionary();
  const a = dict.assets;
  const err = dict.errors;
  const c = dict.common;
  const router = useRouter();
  const [sketchFiles, setSketchFiles] = useState<File[]>([]);
  const [sketchNote, setSketchNote] = useState("");
  const [finalPhotoFiles, setFinalPhotoFiles] = useState<File[]>([]);
  const [sketchRecords, setSketchRecords] = useState(() =>
    getSketchRecords(project)
  );
  const [syncedProject, setSyncedProject] = useState(project);
  if (project !== syncedProject) {
    setSyncedProject(project);
    setSketchRecords(getSketchRecords(project));
  }
  const [finalPhotoUrls, setFinalPhotoUrls] = useState(project.finalPhotos);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSavingSketches, setIsSavingSketches] = useState(false);
  const [isSavingFinalPhotos, setIsSavingFinalPhotos] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isAdvancingSession, setIsAdvancingSession] = useState(false);

  const sketchUrls = sketchRecords.map((record) => record.url);
  const bookedCount = getBookedSessionCount(project);
  const currentSessionIndex = getCurrentSessionIndex(project);
  const canUploadAssets =
    project.status !== "pending_brief" &&
    (project.status !== "quoting" || bookedCount > 0);
  const awaitingDelivery = isAwaitingSessionDelivery(project);
  const canAdvanceToNextSession = canAdvanceToNextSessionDelivery(project);
  const isSingleSession = !isMultiSession(project);
  const canMarkCompleted =
    project.status === "booked" && !hasMoreSessionsToBook(project);
  const isSchedulingNextSession =
    isMultiSession(project) &&
    project.status === "quoting" &&
    bookedCount > 0 &&
    bookedCount < getTotalSessions(project);
  const canReuseSketches = hasReusableSketches({
    ...project,
    sketches: sketchUrls,
  });

  async function uploadSketchFiles(files: File[]): Promise<string[]> {
    const compressed = await compressImages(files);
    const uploaded = await Promise.all(
      compressed.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          `/api/projects/${project.projectId}/sketches`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = (await response.json()) as { url?: string; error?: string };

        if (!response.ok || !data.url) {
          throw new Error(data.error ?? err.uploadSketchFailed);
        }

        return data.url;
      })
    );
    return uploaded;
  }

  async function uploadFiles(files: File[], folder: ProjectAssetFolder) {
    const compressed = await compressImages(files);
    const uploaded = await Promise.all(
      compressed.map((file) =>
        uploadProjectAsset(studioId, project.projectId, file, folder)
      )
    );
    return uploaded;
  }

  async function saveSketches() {
    if (sketchFiles.length === 0) return;

    setError(null);
    setMessage(null);
    setIsSavingSketches(true);

    try {
      const uploaded = await uploadSketchFiles(sketchFiles);
      const trimmedNote = sketchNote.trim();
      const appendPayload = uploaded.map((url) => ({
        url,
        note: trimmedNote || undefined,
      }));

      const response = await fetch(`/api/projects/${project.projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appendSketchRecords: appendPayload }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? err.uploadSketchFailed);
        return;
      }

      const now = new Date();
      const newRecords = uploaded.map((url, index) => ({
        id: `pending-${Date.now()}-${index}`,
        url,
        uploadedAt: now,
        note: trimmedNote || undefined,
        sessionIndex: currentSessionIndex,
      }));
      setSketchRecords((previous) => [...previous, ...newRecords]);
      setSketchFiles([]);
      setSketchNote("");
      setMessage(a.sketchUpdated);
      router.refresh();
    } catch {
      setError(err.uploadSketchFailedRetry);
    } finally {
      setIsSavingSketches(false);
    }
  }

  async function handleUpdateSketchNote(id: string, note: string) {
    setError(null);

    const response = await fetch(`/api/projects/${project.projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updateSketchNote: { id, note } }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? err.updateNoteFailed);
      throw new Error(data.error ?? err.updateNoteFailed);
    }

    const trimmedNote = note.trim();
    setSketchRecords((previous) =>
      previous.map((record) =>
        record.id === id
          ? { ...record, note: trimmedNote || undefined }
          : record
      )
    );
    router.refresh();
  }

  async function saveFinalPhotos() {
    if (finalPhotoFiles.length === 0) return;

    setError(null);
    setMessage(null);
    setIsSavingFinalPhotos(true);

    try {
      const uploaded = await uploadFiles(finalPhotoFiles, "final-photos");
      const nextUrls = [...finalPhotoUrls, ...uploaded];

      const response = await fetch(`/api/projects/${project.projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalPhotos: nextUrls }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? err.uploadFinalPhotoFailed);
        return;
      }

      setFinalPhotoUrls(nextUrls);
      setFinalPhotoFiles([]);
      setMessage(a.finalPhotosUpdated);
      router.refresh();
    } catch {
      setError(err.uploadFinalPhotoFailedRetry);
    } finally {
      setIsSavingFinalPhotos(false);
    }
  }

  async function handleCompleteSessionDelivery() {
    setError(null);
    setMessage(null);
    setIsAdvancingSession(true);

    try {
      const response = await fetch(`/api/projects/${project.projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completeSessionDelivery: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? err.completeSessionFailed);
        return;
      }

      setMessage(
        formatMessage(a.sessionCompletedNotice, {
          index: currentSessionIndex,
          next: currentSessionIndex + 1,
        })
      );
      router.refresh();
    } catch {
      setError(err.operationFailedRetry);
    } finally {
      setIsAdvancingSession(false);
    }
  }

  async function handleMarkCompleted() {
    setError(null);
    setMessage(null);
    setIsCompleting(true);

    try {
      const response = await fetch(`/api/projects/${project.projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? err.markCompletedFailed);
        return;
      }

      setMessage(a.markedCompletedAftercare);
      router.refresh();
    } catch {
      setError(err.operationFailedRetry);
    } finally {
      setIsCompleting(false);
    }
  }

  if (!canUploadAssets && project.status !== "completed") {
    return null;
  }

  const sketchTimelineTitle = canReuseSketches
    ? a.sketchHistoryReusable
    : dict.project.sketchHistory;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{a.deliveryTitle}</CardTitle>
        <CardDescription>
          {awaitingDelivery
            ? isSingleSession
              ? a.sessionConfirmedUploadHintSingle
              : formatMessage(a.sessionConfirmedUploadHint, {
                  index: currentSessionIndex,
                })
            : isSchedulingNextSession
              ? canReuseSketches
                ? formatMessage(a.sessionDeliveredReuseHint, {
                    count: bookedCount,
                  })
                : formatMessage(a.sessionDeliveredUploadHint, {
                    count: bookedCount,
                    index: currentSessionIndex,
                  })
              : a.defaultUploadHint}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {canUploadAssets && project.status !== "completed" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4">
              <AssetSectionHeader
                icon={PenLine}
                title={a.sketchTitle}
                subtitle={a.sketchSubtitleBefore}
                accentClassName="bg-primary/10 text-primary"
              />

              {sketchRecords.length > 0 && (
                <SketchTimeline
                  records={sketchRecords}
                  title={sketchTimelineTitle}
                  mode="studio"
                  embedded
                  onUpdateNote={handleUpdateSketchNote}
                />
              )}

              {canReuseSketches && (
                <p className="text-xs text-muted-foreground">
                  {a.reuseFromSecondSession}
                </p>
              )}

              <ImageUploadZone
                compact
                mode="multiple"
                label={canReuseSketches ? a.uploadNewVersionOptional : a.uploadSketch}
                hint={
                  canReuseSketches
                    ? a.uploadNewVersionHint
                    : a.uploadSketchHint
                }
                files={sketchFiles}
                onChange={setSketchFiles}
                existingUrls={[]}
              />

              {sketchFiles.length > 0 && (
                <div className="flex flex-col gap-1">
                  <Label htmlFor="sketch-upload-note" className="text-xs">
                    {a.versionNoteLabel}
                  </Label>
                  <Input
                    id="sketch-upload-note"
                    value={sketchNote}
                    onChange={(event) => setSketchNote(event.target.value)}
                    maxLength={120}
                    placeholder={a.versionNotePlaceholder}
                    className="h-8 text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {a.versionNoteLimit}
                  </p>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                disabled={isSavingSketches || sketchFiles.length === 0}
                onClick={saveSketches}
              >
                {isSavingSketches
                  ? a.uploading
                  : canReuseSketches
                    ? a.uploadNewVersion
                    : a.saveSketch}
              </Button>
            </section>

            <section className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4">
              <AssetSectionHeader
                icon={Camera}
                title={a.finalPhotoAfter}
                subtitle={a.finalPhotoSubtitle}
                accentClassName="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              />

              <ImageUploadZone
                compact
                mode="multiple"
                label={a.saveFinalPhotos}
                hint={a.uploadFinalPhotoHint}
                files={finalPhotoFiles}
                onChange={setFinalPhotoFiles}
                existingUrls={finalPhotoUrls}
                onExistingUrlsChange={setFinalPhotoUrls}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                disabled={isSavingFinalPhotos || finalPhotoFiles.length === 0}
                onClick={saveFinalPhotos}
              >
                {isSavingFinalPhotos ? a.uploading : a.saveFinalPhotos}
              </Button>
            </section>
          </div>
        )}

        {project.status === "completed" && (
          <>
            <p className="text-sm text-muted-foreground">
              {a.projectClosedHint}
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              <section className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4">
                <AssetSectionHeader
                  icon={PenLine}
                  title={a.sketchTitle}
                  subtitle={a.sketchHistoryBefore}
                  accentClassName="bg-primary/10 text-primary"
                />
                <SketchTimeline
                  records={sketchRecords}
                  title={dict.project.sketchHistory}
                  mode="studio"
                  embedded
                />
              </section>

              <section className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4">
                <AssetSectionHeader
                  icon={Camera}
                  title={a.finalPhotoAfter}
                  subtitle={a.finalPhotoAfter}
                  accentClassName="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                />
                <ProjectAssetsGallery
                  title={a.finalPhotoAfter}
                  urls={finalPhotoUrls}
                  embedded
                  emptyHint={a.noFinalPhotos}
                />
              </section>
            </div>
          </>
        )}

        {canAdvanceToNextSession && (
          <div className="rounded-lg border bg-muted/20 p-4">
            <p className="text-sm font-medium">{a.completeSessionTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatMessage(a.completeSessionHint, {
                next: currentSessionIndex + 1,
              })}
            </p>
            <Button
              type="button"
              className="mt-3"
              disabled={isAdvancingSession}
              onClick={handleCompleteSessionDelivery}
            >
              {isAdvancingSession
                ? c.processing
                : a.completeSessionButton}
            </Button>
          </div>
        )}

        {canMarkCompleted && (
          <div className="rounded-lg border bg-muted/20 p-4">
            <p className="text-sm font-medium">{a.closeProjectTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isSingleSession ? a.closeProjectHintSingle : a.closeProjectHint}
            </p>
            <Button
              type="button"
              className="mt-3"
              disabled={isCompleting}
              onClick={handleMarkCompleted}
            >
              {isCompleting ? c.processing : a.markCompleted}
            </Button>
          </div>
        )}

        {message && (
          <p
            className="text-sm text-emerald-700 dark:text-emerald-300"
            role="status"
          >
            {message}
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
