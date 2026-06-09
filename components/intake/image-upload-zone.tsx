"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { formatMessage } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";

const DEFAULT_MAX_IMAGES = 6;

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function mergeFiles(existing: File[], incoming: File[]) {
  const keys = new Set(existing.map(fileKey));
  const unique = incoming.filter((file) => !keys.has(fileKey(file)));
  return [...existing, ...unique];
}

interface ImageUploadZoneProps {
  mode: "single" | "multiple";
  files: File[];
  onChange: (files: File[]) => void;
  label: string;
  hint?: string;
  error?: string;
  existingUrls?: string[];
  onExistingUrlsChange?: (urls: string[]) => void;
  compact?: boolean;
  thumbnailSize?: "default" | "sm";
  maxImages?: number;
}

export function ImageUploadZone({
  mode,
  files,
  onChange,
  label,
  hint,
  error,
  existingUrls = [],
  onExistingUrlsChange,
  compact = false,
  thumbnailSize = "default",
  maxImages = DEFAULT_MAX_IMAGES,
}: ImageUploadZoneProps) {
  const dict = useAppDictionary();
  const b = dict.booking;
  const c = dict.common;
  const isSmallThumbnail = thumbnailSize === "sm";
  const inputRef = useRef<HTMLInputElement>(null);

  const previews = useMemo(
    () =>
      files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        key: fileKey(file),
      })),
    [files]
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const totalCount = files.length + existingUrls.length;
  const canAddMore =
    mode === "single" ? totalCount === 0 : totalCount < maxImages;

  function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (selected.length === 0) return;

    if (mode === "single") {
      onChange([selected[0]]);
      return;
    }

    const merged = mergeFiles(files, selected).slice(
      0,
      maxImages - existingUrls.length
    );
    onChange(merged);
  }

  function removeFile(key: string) {
    onChange(files.filter((file) => fileKey(file) !== key));
  }

  function removeExistingUrl(url: string) {
    onExistingUrlsChange?.(existingUrls.filter((item) => item !== url));
  }

  const hasImages = previews.length > 0 || existingUrls.length > 0;

  return (
    <div className={cn("flex flex-col", compact ? "gap-2" : "gap-3")}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={mode === "multiple"}
        className="hidden"
        onChange={handleSelect}
      />

      {canAddMore && !hasImages && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full cursor-pointer flex-col items-center rounded-lg border border-dashed hover:bg-muted/50",
            compact ? "gap-1 px-4 py-3.5" : "gap-2 px-6 py-6"
          )}
        >
          <Upload
            className={cn(
              "text-muted-foreground",
              compact ? "size-5" : "size-6"
            )}
          />
          <span className={cn("font-medium", compact ? "text-sm" : "text-sm")}>
            {label}
          </span>
          {hint && (
            <span className="text-center text-xs text-muted-foreground">
              {hint}
            </span>
          )}
        </button>
      )}

      {mode === "multiple" && totalCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {formatMessage(b.imagesSelected, { count: totalCount })}
          {totalCount < maxImages
            ? formatMessage(b.imagesSelectedRemaining, {
                count: maxImages - totalCount,
              })
            : b.imagesAtMax}
        </p>
      )}

      {hasImages && (
        <div
          className={cn(
            mode === "single" && isSmallThumbnail
              ? "flex flex-col"
              : "grid",
            compact ? "gap-2" : "gap-3",
            mode === "single" && !isSmallThumbnail
              ? "grid-cols-1"
              : mode === "multiple"
                ? "grid-cols-2 sm:grid-cols-3"
                : undefined
          )}
        >
          {existingUrls.map((url) => (
            <div
              key={url}
              className={cn(
                "group relative overflow-hidden rounded-lg border bg-muted",
                isSmallThumbnail
                  ? "size-16 shrink-0 sm:size-20"
                  : "aspect-square"
              )}
            >
              <Image
                src={url}
                alt={c.uploadedImageAlt}
                fill
                className="object-cover"
                sizes="200px"
              />
              {onExistingUrlsChange && (
                <button
                  type="button"
                  aria-label={c.removeUploadedAria}
                  onClick={() => removeExistingUrl(url)}
                  className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="size-3.5" />
                </button>
              )}
              <p className="absolute right-0 bottom-0 left-0 truncate bg-black/50 px-2 py-1 text-xs text-white">
                {c.uploadedBadge}
              </p>
            </div>
          ))}

          {previews.map((preview) => (
            <div
              key={preview.key}
              className={cn(
                "group relative overflow-hidden rounded-lg border bg-muted",
                isSmallThumbnail
                  ? "size-16 shrink-0 sm:size-20"
                  : "aspect-square"
              )}
            >
              <Image
                src={preview.url}
                alt={preview.file.name}
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                aria-label={c.removeAria}
                onClick={() => removeFile(preview.key)}
                className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>
              <p className="absolute right-0 bottom-0 left-0 truncate bg-black/50 px-2 py-1 text-xs text-white">
                {preview.file.name}
              </p>
            </div>
          ))}

          {mode === "multiple" && canAddMore && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground hover:bg-muted/50",
                compact ? "gap-0.5 text-xs" : "gap-1 text-sm"
              )}
            >
              <Upload className={compact ? "size-4" : "size-5"} />
              {b.addAnother}
            </button>
          )}

          {mode === "single" && canAddMore && hasImages && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex w-full flex-col items-center rounded-lg border border-dashed text-muted-foreground hover:bg-muted/50",
                compact ? "gap-1 px-4 py-3 text-sm" : "gap-2 px-6 py-4 text-sm"
              )}
            >
              <Upload className={compact ? "size-4" : "size-5"} />
              {b.replacePhoto}
            </button>
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
