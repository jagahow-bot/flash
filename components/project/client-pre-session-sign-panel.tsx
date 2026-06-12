"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type SignaturePad from "signature_pad";
import { SignatureCanvas } from "@/components/project/signature-canvas";
import { ZoomableDocumentPreview } from "@/components/project/zoomable-document-preview";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { getDefaultSignerInfo } from "@/lib/pre-session-documents/signer-info";
import {
  getPreSessionRecords,
  getTemplateByDocumentId,
  hasClientPendingPreSessionDocuments,
} from "@/lib/pre-session-documents/records";
import { dataUrlToFile } from "@/lib/storage/upload-pre-session-signed-doc";
import {
  createPreSessionSignerInfoSchemaFromDict,
  type PreSessionSignerInfoValues,
} from "@/lib/validations/pre-session-signer";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

function OnlineDocumentSigningForm({
  documentId,
  project,
  studioSlug,
  clientEmail,
  onCancel,
}: {
  documentId: string;
  project: Project;
  studioSlug: string;
  clientEmail?: string;
  onCancel: () => void;
}) {
  const dict = useAppDictionary();
  const ps = dict.preSession;
  const sig = dict.signature;
  const c = dict.common;
  const router = useRouter();
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = useMemo(
    () => createPreSessionSignerInfoSchemaFromDict(dict),
    [dict]
  );

  const defaultSignerInfo = useMemo(
    () => getDefaultSignerInfo(project, clientEmail),
    [project, clientEmail]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PreSessionSignerInfoValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultSignerInfo,
    mode: "onChange",
  });

  async function submitSignature(values: PreSessionSignerInfoValues) {
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
      formData.append("signerInfo", JSON.stringify(values));

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

      onCancel();
      router.refresh();
    } catch {
      setError(sig.signFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">{ps.signerInfoTitle}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor={`signer-name-${documentId}`}>
              {ps.signerNameLabel}
            </Label>
            <Input
              id={`signer-name-${documentId}`}
              autoComplete="name"
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-sm text-destructive" role="alert">
                {errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`signer-birthday-${documentId}`}>
              {ps.signerBirthdayLabel}
            </Label>
            <Input
              id={`signer-birthday-${documentId}`}
              type="date"
              {...register("birthday")}
            />
            {errors.birthday ? (
              <p className="text-sm text-destructive" role="alert">
                {errors.birthday.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`signer-phone-${documentId}`}>
              {ps.signerPhoneLabel}
            </Label>
            <Input
              id={`signer-phone-${documentId}`}
              type="tel"
              autoComplete="tel"
              {...register("phone")}
            />
            {errors.phone ? (
              <p className="text-sm text-destructive" role="alert">
                {errors.phone.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor={`signer-email-${documentId}`}>
              {ps.signerEmailLabel}
            </Label>
            <Input
              id={`signer-email-${documentId}`}
              type="email"
              autoComplete="email"
              inputMode="email"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-destructive" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </div>
        </div>
      </div>

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
          disabled={isSubmitting || signatureEmpty || !agreed || !isValid}
          onClick={() => {
            void handleSubmit(submitSignature)();
          }}
        >
          {isSubmitting ? ps.submittingSignature : ps.submitSignature}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {c.cancel}
        </Button>
      </div>
    </div>
  );
}

export function ClientPreSessionSignPanel({
  project,
  studio,
  studioSlug,
  clientEmail,
}: {
  project: Project;
  studio: Studio;
  studioSlug: string;
  clientEmail?: string;
}) {
  const dict = useAppDictionary();
  const ps = dict.preSession;
  const c = dict.common;
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [signingSessionKey, setSigningSessionKey] = useState(0);

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
                    setSigningSessionKey((key) => key + 1);
                    setActiveDocumentId(record.documentId);
                  }}
                >
                  {ps.startSigning}
                </Button>
              ) : (
                <OnlineDocumentSigningForm
                  key={`${record.documentId}-${signingSessionKey}`}
                  documentId={record.documentId}
                  project={project}
                  studioSlug={studioSlug}
                  clientEmail={clientEmail}
                  onCancel={() => setActiveDocumentId(null)}
                />
              )}
            </DocumentCard>
          );
        })}
      </CardContent>
    </Card>
  );
}
