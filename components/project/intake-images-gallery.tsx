"use client";

import Image from "next/image";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { formatMessage } from "@/lib/i18n/format";
import type { IntakeForm } from "@/types/intake-form";

export function IntakeImagesGallery({ intakeForm }: { intakeForm: IntakeForm }) {
  const dict = useAppDictionary();
  const p = dict.project;
  const b = dict.booking;
  const referenceUrls = intakeForm.referenceUrls ?? [];
  const hasPlacement = Boolean(intakeForm.placementPhotoUrl);
  const hasReferences = referenceUrls.length > 0;

  if (!hasPlacement && !hasReferences) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 border-t pt-4">
      <p className="font-medium">{p.clientUploads}</p>

      {hasPlacement && intakeForm.placementPhotoUrl && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">{p.placementPhoto}</p>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
            <Image
              src={intakeForm.placementPhotoUrl}
              alt={b.placementPhoto}
              fill
              className="object-contain"
              sizes="(max-width: 672px) 100vw, 672px"
            />
          </div>
        </div>
      )}

      {hasReferences && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            {formatMessage(p.referenceCount, { count: referenceUrls.length })}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {referenceUrls.map((url, index) => (
              <div
                key={url}
                className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
              >
                <Image
                  src={url}
                  alt={`${b.referenceImages} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
