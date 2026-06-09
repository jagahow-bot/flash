"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploadZone } from "@/components/intake/image-upload-zone";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { compressImage } from "@/lib/storage/compress-image";
import { Button } from "@/components/ui/button";

export function ClientDepositUpload({
  projectId,
  studioSlug,
  totalSessions = 1,
}: {
  projectId: string;
  studioSlug: string;
  totalSessions?: number;
}) {
  const dict = useAppDictionary();
  const p = dict.project;
  const dep = dict.deposit;
  const c = dict.common;
  const router = useRouter();
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (proofFiles.length === 0) {
      setError(dep.uploadProofRequired);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const compressed = await compressImage(proofFiles[0]);
      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("studioSlug", studioSlug);

      const response = await fetch(
        `/api/projects/${projectId}/deposit-proof`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? p.submitFailed);
        return;
      }

      router.refresh();
    } catch {
      setError(p.submitFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">{dep.uploadSessionDepositTitle}</p>
      <ImageUploadZone
        mode="single"
        files={proofFiles}
        onChange={setProofFiles}
        label={dep.transferScreenshotLabel}
        hint={
          totalSessions > 1
            ? dep.multiSessionDepositHint
            : dep.singleDepositHint
        }
      />

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button
        type="button"
        size="sm"
        className="w-fit"
        disabled={isSubmitting}
        onClick={handleSubmit}
      >
        {isSubmitting ? c.submitting : p.submitDepositProof}
      </Button>
    </div>
  );
}
