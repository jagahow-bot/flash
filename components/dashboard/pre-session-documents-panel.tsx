"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { ImageUploadZone } from "@/components/intake/image-upload-zone";
import { ZoomableDocumentPreview } from "@/components/project/zoomable-document-preview";
import {
  getPreSessionRecords,
  getTemplateByDocumentId,
  hasPendingInPersonDocuments,
} from "@/lib/pre-session-documents/records";
import { compressImage } from "@/lib/storage/compress-image";
import { uploadPreSessionSignedDoc } from "@/lib/storage/upload-pre-session-signed-doc";
import type { Project } from "@/types/project";
import type { Studio } from "@/types/studio";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PreSessionDocumentsPanel({
  project,
  studio,
  variant = "action",
}: {
  project: Project;
  studio: Studio;
  variant?: "action" | "archive";
}) {
  const dict = useAppDictionary();
  const ps = dict.preSession;
  const c = dict.common;
  const err = dict.errors;
  const router = useRouter();
  const records = useMemo(
    () => getPreSessionRecords(project, studio),
    [project, studio]
  );
  const [uploadFiles, setUploadFiles] = useState<Record<string, File[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const showAction = hasPendingInPersonDocuments(project, studio);
  const completed = records.filter((record) => record.status === "completed");
  const pendingInPerson = records.filter(
    (record) =>
      record.signatureMode === "in_person" && record.status === "pending"
  );

  if (records.length === 0) {
    return null;
  }

  if (variant === "action" && !showAction) {
    return null;
  }

  if (variant === "archive" && completed.length === 0) {
    return null;
  }

  async function handleUpload(documentId: string) {
    const files = uploadFiles[documentId] ?? [];
    if (files.length === 0) return;

    setError(null);
    setSubmittingId(documentId);

    try {
      const compressed = await compressImage(files[0]);
      const fileUrl = await uploadPreSessionSignedDoc(
        studio.studioId,
        project.projectId,
        documentId,
        compressed
      );

      const response = await fetch(
        `/api/projects/${project.projectId}/pre-session-documents`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId, fileUrl }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? err.uploadFailed);
        return;
      }

      setUploadFiles((prev) => ({ ...prev, [documentId]: [] }));
      router.refresh();
    } catch {
      setError(err.uploadFailedRetry);
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{ps.title}</CardTitle>
        <CardDescription>
          {variant === "action" ? ps.uploadScanHint : ps.archiveTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {variant === "action"
          ? pendingInPerson.map((record) => {
              const template = getTemplateByDocumentId(
                studio,
                record.documentId
              );
              const files = uploadFiles[record.documentId] ?? [];

              return (
                <div
                  key={record.documentId}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium">{record.title}</p>
                      {template?.description ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {record.signatureMode === "in_person"
                          ? ps.signatureInPerson
                          : ps.signatureOnlineAdvance}
                        {record.isRequired ? ` ${c.requiredSuffix}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
                      {ps.pendingSignature}
                    </span>
                  </div>

                  {template?.templateFileUrl ? (
                    <div className="mt-2">
                      <ZoomableDocumentPreview
                        url={template.templateFileUrl}
                        title={record.title}
                        tapToZoomLabel={ps.tapToZoom}
                        closeLabel={c.closeAria}
                        zoomInLabel={ps.zoomIn}
                        zoomOutLabel={ps.zoomOut}
                        openPdfLabel={ps.viewBlankTemplate}
                      />
                    </div>
                  ) : null}

                  <div className="mt-3">
                    <ImageUploadZone
                      mode="single"
                      files={files}
                      onChange={(next) =>
                        setUploadFiles((prev) => ({
                          ...prev,
                          [record.documentId]: next,
                        }))
                      }
                      label={ps.uploadSignedLabel}
                      hint={ps.uploadSignedHint}
                    />
                  </div>

                  <Button
                    type="button"
                    className="mt-3"
                    size="sm"
                    disabled={
                      files.length === 0 ||
                      submittingId === record.documentId
                    }
                    onClick={() => handleUpload(record.documentId)}
                  >
                    {submittingId === record.documentId
                      ? dict.assets.uploading
                      : ps.confirmArchive}
                  </Button>
                </div>
              );
            })
          : null}

        {variant === "action" && completed.length > 0 ? (
          <p className="text-xs font-medium text-muted-foreground">
            {ps.completedSection}
          </p>
        ) : null}

        {(variant === "archive" || variant === "action") && completed.length > 0
          ? completed.map((record) => (
              <div
                key={record.documentId}
                className="rounded-lg border border-border p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium">{record.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {record.signatureMode === "in_person"
                        ? ps.signatureInPerson
                        : ps.signatureOnlineAdvance}
                      {record.completionMethod === "studio_upload"
                        ? ps.completedByStudio
                        : ps.completedByClient}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-900">
                    {ps.completed}
                  </span>
                </div>

                {record.signerInfo ? (
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">
                        {ps.signerNameLabel}
                      </dt>
                      <dd className="font-medium">{record.signerInfo.name}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        {ps.signerBirthdayLabel}
                      </dt>
                      <dd className="font-medium">
                        {record.signerInfo.birthday}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        {ps.signerPhoneLabel}
                      </dt>
                      <dd className="font-medium">{record.signerInfo.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        {ps.signerEmailLabel}
                      </dt>
                      <dd className="font-medium break-all">
                        {record.signerInfo.email}
                      </dd>
                    </div>
                  </dl>
                ) : null}

                {record.fileUrl ? (
                  <div className="mt-3 max-w-sm">
                    <ZoomableDocumentPreview
                      url={record.fileUrl}
                      title={record.title}
                      tapToZoomLabel={ps.tapToZoom}
                      closeLabel={c.closeAria}
                      zoomInLabel={ps.zoomIn}
                      zoomOutLabel={ps.zoomOut}
                      openPdfLabel={ps.viewSignedDocument}
                    />
                  </div>
                ) : null}
              </div>
            ))
          : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
