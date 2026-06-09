"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { formatMessage } from "@/lib/i18n/format";
import { ChevronDown, ChevronUp, FileText, Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { uploadDocumentTemplate } from "@/lib/storage/upload-document-template";
import type {
  PreSessionDocumentTemplate,
  PreSessionSignatureMode,
} from "@/types/pre-session-document";
import type { Studio } from "@/types/studio";

function createEmptyTemplate(sortOrder: number): PreSessionDocumentTemplate {
  return {
    documentId: crypto.randomUUID(),
    title: "",
    description: "",
    templateFileUrl: "",
    signatureMode: "in_person",
    isRequired: true,
    sortOrder,
    createdAt: new Date(),
  };
}

export function PreSessionDocumentsSettings({ studio }: { studio: Studio }) {
  const dict = useAppDictionary();
  const ps = dict.preSession;
  const c = dict.common;
  const err = dict.errors;
  const router = useRouter();
  const signatureModeOptions: {
    value: PreSessionSignatureMode;
    label: string;
  }[] = [
    { value: "in_person", label: ps.signatureInPerson },
    { value: "online_advance", label: ps.signatureOnlineAdvance },
  ];
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [documents, setDocuments] = useState<PreSessionDocumentTemplate[]>(
    [...(studio.preSessionDocuments ?? [])].sort(
      (a, b) => a.sortOrder - b.sortOrder
    )
  );
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function updateDocument(
    documentId: string,
    patch: Partial<PreSessionDocumentTemplate>
  ) {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.documentId === documentId ? { ...doc, ...patch } : doc
      )
    );
  }

  function addDocument() {
    setDocuments((prev) => [...prev, createEmptyTemplate(prev.length)]);
  }

  function removeDocument(documentId: string) {
    setDocuments((prev) =>
      prev
        .filter((doc) => doc.documentId !== documentId)
        .map((doc, index) => ({ ...doc, sortOrder: index }))
    );
  }

  function moveDocument(documentId: string, direction: "up" | "down") {
    setDocuments((prev) => {
      const index = prev.findIndex((doc) => doc.documentId === documentId);
      if (index < 0) return prev;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;

      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((doc, sortOrder) => ({ ...doc, sortOrder }));
    });
  }

  async function handleTemplateUpload(documentId: string, file: File) {
    setUploadingId(documentId);
    setError(null);

    try {
      const url = await uploadDocumentTemplate(
        studio.studioId,
        documentId,
        file
      );
      updateDocument(documentId, { templateFileUrl: url });
    } catch {
      setError(ps.templateUploadFailed);
    } finally {
      setUploadingId(null);
    }
  }

  async function handleSave() {
    setError(null);
    setSuccessMessage(null);

    const invalid = documents.find(
      (doc) => !doc.title.trim() || !doc.templateFileUrl
    );
    if (invalid) {
      setError(ps.documentIncomplete);
      return;
    }

    setIsSaving(true);

    try {
      const payload = documents.map((doc, index) => ({
        documentId: doc.documentId,
        title: doc.title.trim(),
        description: doc.description?.trim() || undefined,
        templateFileUrl: doc.templateFileUrl,
        signatureMode: doc.signatureMode,
        isRequired: doc.isRequired,
        sortOrder: index,
        createdAt: (doc.createdAt ?? new Date()).toISOString(),
      }));

      const response = await fetch("/api/studio/pre-session-documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preSessionDocuments: payload }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? err.saveFailed);
        return;
      }

      setSuccessMessage(ps.settingsSaved);
      router.refresh();
    } catch {
      setError(err.saveFailedRetry);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ps.title}</CardTitle>
        <CardDescription>{ps.settingsDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">{ps.emptyHint}</p>
        ) : null}

        {documents.map((doc, index) => (
          <div
            key={doc.documentId}
            className="rounded-lg border border-border p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                {formatMessage(ps.documentIndex, { index: index + 1 })}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === 0}
                  onClick={() => moveDocument(doc.documentId, "up")}
                  aria-label={c.moveUpAria}
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === documents.length - 1}
                  onClick={() => moveDocument(doc.documentId, "down")}
                  aria-label={c.moveDownAria}
                >
                  <ChevronDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeDocument(doc.documentId)}
                  aria-label={c.deleteAria}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor={`title-${doc.documentId}`}>
                  {ps.documentNameLabel}
                </Label>
                <Input
                  id={`title-${doc.documentId}`}
                  value={doc.title}
                  onChange={(event) =>
                    updateDocument(doc.documentId, {
                      title: event.target.value,
                    })
                  }
                  placeholder={ps.documentNamePlaceholder}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor={`desc-${doc.documentId}`}>
                  {ps.documentDescLabel}
                </Label>
                <Textarea
                  id={`desc-${doc.documentId}`}
                  rows={2}
                  value={doc.description ?? ""}
                  onChange={(event) =>
                    updateDocument(doc.documentId, {
                      description: event.target.value,
                    })
                  }
                  placeholder={ps.documentDescPlaceholder}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>{ps.signatureModeLabel}</Label>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                  {signatureModeOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="radio"
                        name={`mode-${doc.documentId}`}
                        checked={doc.signatureMode === option.value}
                        onChange={() =>
                          updateDocument(doc.documentId, {
                            signatureMode: option.value,
                          })
                        }
                        className="size-4"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={doc.isRequired}
                  onCheckedChange={(checked) =>
                    updateDocument(doc.documentId, {
                      isRequired: checked === true,
                    })
                  }
                />
                {ps.requiredCheckbox}
              </label>

              <div className="flex flex-col gap-2">
                <Label>{ps.templateLabel}</Label>
                <input
                  ref={(node) => {
                    fileInputRefs.current[doc.documentId] = node;
                  }}
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleTemplateUpload(doc.documentId, file);
                    }
                    event.target.value = "";
                  }}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingId === doc.documentId}
                    onClick={() =>
                      fileInputRefs.current[doc.documentId]?.click()
                    }
                  >
                    <FileText className="size-4" />
                    {uploadingId === doc.documentId
                      ? dict.assets.uploading
                      : doc.templateFileUrl
                        ? ps.replaceTemplate
                        : ps.uploadTemplate}
                  </Button>
                  {doc.templateFileUrl ? (
                    <a
                      href={doc.templateFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary underline-offset-4 hover:underline"
                    >
                      {ps.viewUploadedTemplate}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={addDocument}
        >
          <Plus className="size-4" />
          {ps.addDocument}
        </Button>

        {successMessage ? (
          <p
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
            role="status"
          >
            {successMessage}
          </p>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="button"
          disabled={isSaving}
          className="w-fit"
          onClick={handleSave}
        >
          {isSaving ? c.saving : ps.savePreSessionSettings}
        </Button>
      </CardContent>
    </Card>
  );
}
