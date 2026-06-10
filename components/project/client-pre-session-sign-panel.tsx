"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type SignaturePad from "signature_pad";
import { SignatureCanvas } from "@/components/project/signature-canvas";
import { ZoomableDocumentPreview } from "@/components/project/zoomable-document-preview";
import {
  getPreSessionRecords,
  getTemplateByDocumentId,
  hasClientPendingPreSessionDocuments,
} from "@/lib/pre-session-documents/records";
import { dataUrlToFile } from "@/lib/storage/upload-pre-session-signed-doc";
import type { PreSessionDocumentRecord } from "@/types/pre-session-document";
import type { Project } from "@/types/project";
import type { Studio } from "@/types/studio";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAppDictionary } from "@/components/providers/locale-provider";

function DocumentCard({
  record,
  studio,
  ps,
  c,
  children,
}: {
  record: PreSessionDocumentRecord;
  studio: Studio;
  ps: ReturnType<typeof useAppDictionary>["preSession"];
  c: ReturnType<typeof useAppDictionary>["common"];
  children?: React.ReactNode;
}) {
  const template = getTemplateByDocumentId(studio, record.documentId);

  return (
    <div className="rounded-lg border border-border p-4">
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
        <div className="mt-3">
          <ZoomableDocumentPreview
            url={template.templateFileUrl}
            title={record.title}
            tapToZoomLabel={ps.tapToZoom}
            closeLabel={c.closeAria}
            zoomInLabel={ps.zoomIn}
            zoomOutLabel={ps.zoomOut}
            openPdfLabel={ps.openTemplatePdf}
          />
        </div>
      ) : null}

      {children}
    </div>
  );
}

export function ClientPreSessionSignPanel({
  project,
  studio,
  studioSlug,
}: {
  project: Project;
  studio: Studio;
  studioSlug: string;
}) {
  const dict = useAppDictionary();
  const ps = dict.preSession;
  const sig = dict.signature;
  const c = dict.common;
  const router = useRouter();
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const records = useMemo(
    () => getPreSessionRecords(project, studio),
    [project, studio]
  );

  const pendingOnline = records.filter(
    (record) =>
      record.signatureMode === "online_advance" && record.status === "pending"
  );
  const pendingInPerson = records.filter(
    (record) =>
      record.signatureMode === "in_person" && record.status === "pending"
  );

  if (!hasClientPendingPreSessionDocuments(project, studio)) {
    return null;
  }

  async function handleSubmit(documentId: string) {
    const pad = signaturePadRef.current;
    if (!pad || pad.isEmpty()) {
      setError(sig.signFirst);
      return;
    }

    if (!agreed) {
      setError(sig.agreeTermsFirst);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const dataUrl = pad.toDataURL("image/png");
      const file = dataUrlToFile(dataUrl, `signature-${documentId}.png`);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("studioSlug", studioSlug);
      formData.append("documentId", documentId);
      formData.append("clientSignatureDataUrl", dataUrl);

      const response = await fetch(
        `/api/projects/${project.projectId}/pre-session-documents/sign`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? sig.signFailed);
        return;
      }

      setActiveDocumentId(null);
      setAgreed(false);
      setSignatureEmpty(true);
      pad.clear();
      router.refresh();
    } catch {
      setError(sig.signFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{ps.title}</CardTitle>
        <CardDescription>{ps.clientPanelDescription}</CardDescription>
        {project.status === "deposit_submitted" ? (
          <p className="text-sm text-muted-foreground">
            {ps.clientAwaitingBookingConfirm}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {pendingInPerson.map((record) => (
          <DocumentCard
            key={record.documentId}
            record={record}
            studio={studio}
            ps={ps}
            c={c}
          >
            <p className="mt-3 text-sm text-muted-foreground">
              {ps.clientInPersonHint}
            </p>
          </DocumentCard>
        ))}

        {pendingOnline.map((record) => {
          const isActive = activeDocumentId === record.documentId;

          return (
            <DocumentCard
              key={record.documentId}
              record={record}
              studio={studio}
              ps={ps}
              c={c}
            >
              {!isActive ? (
                <Button
                  type="button"
                  className="mt-3"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveDocumentId(record.documentId);
                    setAgreed(false);
                    setError(null);
                  }}
                >
                  {ps.startSigning}
                </Button>
              ) : (
                <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4">
                  <label className="flex items-start gap-2 text-sm">
                    <Checkbox
                      checked={agreed}
                      onCheckedChange={(checked) => setAgreed(checked === true)}
                    />
                    <span>{ps.consentCheckbox}</span>
                  </label>

                  <div className="flex flex-col gap-2">
                    <Label>{ps.signHereLabel}</Label>
                    <SignatureCanvas
                      padRef={signaturePadRef}
                      onChange={setSignatureEmpty}
                    />
                  </div>

                  {error ? (
                    <p className="text-sm text-destructive" role="alert">
                      {error}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={isSubmitting || signatureEmpty || !agreed}
                      onClick={() => handleSubmit(record.documentId)}
                    >
                      {isSubmitting ? ps.submittingSignature : ps.submitSignature}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setActiveDocumentId(null)}
                    >
                      {c.cancel}
                    </Button>
                  </div>
                </div>
              )}
            </DocumentCard>
          );
        })}
      </CardContent>
    </Card>
  );
}
