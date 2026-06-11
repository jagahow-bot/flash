"use client";

import { useEffect, useState } from "react";
import type {
  FieldErrors,
  FieldValues,
  Path,
  PathValue,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import Image from "next/image";
import { ImageUploadZone } from "@/components/intake/image-upload-zone";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { formatMessage } from "@/lib/i18n/format";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ZoomIn } from "lucide-react";

export interface PublicFlashDesign {
  designId: string;
  title: string;
  imageUrl: string;
  allowedSizes: string[];
  price: number | null;
  usesUniformPrice: boolean;
}

interface FlashBookingSectionProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  errors: FieldErrors<T>;
  placementFiles: File[];
  onPlacementFilesChange: (files: File[]) => void;
  designs: PublicFlashDesign[];
  flashUniformPrice: number | null;
  isLoadingDesigns: boolean;
}

export function FlashBookingSection<T extends FieldValues>({
  register,
  watch,
  setValue,
  errors,
  placementFiles,
  onPlacementFilesChange,
  designs,
  flashUniformPrice,
  isLoadingDesigns,
}: FlashBookingSectionProps<T>) {
  const dict = useAppDictionary();
  const b = dict.booking;
  const f = dict.flash;
  const c = dict.common;

  const selectedDesignId = watch("flashDesignId" as Path<T>);
  const selectedSize = watch("size" as Path<T>);
  const selectedDesign = designs.find(
    (design) => design.designId === selectedDesignId
  );
  const [lightboxDesign, setLightboxDesign] = useState<PublicFlashDesign | null>(
    null
  );

  function formatPrice(price: number | null): string {
    if (price === null) return c.emptyDash;
    return formatMessage(c.priceFormat, { amount: price });
  }

  function handleSelectDesign(design: PublicFlashDesign) {
    setValue("flashDesignId" as Path<T>, design.designId as PathValue<T, Path<T>>, {
      shouldValidate: true,
    });
    setValue("size" as Path<T>, "" as PathValue<T, Path<T>>, {
      shouldValidate: false,
    });
  }

  if (isLoadingDesigns) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">{c.loading}</p>
        </CardContent>
      </Card>
    );
  }

  if (designs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">{f.noDesignsAvailable}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="flex flex-col gap-6 pt-6">
          <div className="flex flex-col gap-2">
            <Label>{f.selectDesign} *</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {designs.map((design) => {
                const isSelected = design.designId === selectedDesignId;
                return (
                  <div
                    key={design.designId}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectDesign(design)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleSelectDesign(design);
                      }
                    }}
                    className={cn(
                      "flex cursor-pointer flex-col overflow-hidden rounded-xl border text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      isSelected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="relative aspect-square bg-muted">
                      <Image
                        src={design.imageUrl}
                        alt={design.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 200px"
                      />
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setLightboxDesign(design);
                        }}
                        className={cn(
                          "absolute top-1.5 right-1.5 z-10 flex size-8 items-center justify-center rounded-full",
                          "bg-background/90 text-foreground shadow-sm backdrop-blur-sm",
                          "transition-colors hover:bg-background"
                        )}
                        aria-label={f.enlargeImage}
                      >
                        <ZoomIn className="size-4" aria-hidden />
                      </button>
                    </div>
                    <div className="flex flex-col gap-0.5 p-2.5">
                      <p className="line-clamp-2 text-sm font-medium">
                        {design.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(design.price)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.flashDesignId && (
              <p className="text-sm text-destructive">
                {errors.flashDesignId.message as string}
              </p>
            )}
          </div>

          {selectedDesign && (
            <div className="flex flex-col gap-2">
              <Label>{f.selectSize} *</Label>
              <div className="flex flex-wrap gap-2">
                {selectedDesign.allowedSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      setValue("size" as Path<T>, size as PathValue<T, Path<T>>, {
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {errors.size && (
                <p className="text-sm text-destructive">{errors.size.message as string}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {f.priceLabel}: {formatPrice(selectedDesign.price)}
                {selectedDesign.usesUniformPrice && flashUniformPrice !== null
                  ? ` (${f.uniformPriceNote})`
                  : null}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="flash-placement">{f.placementLabel} *</Label>
            <Input
              id="flash-placement"
              placeholder={b.placementPlaceholder}
              {...register("placement" as Path<T>)}
            />
            {errors.placement && (
              <p className="text-sm text-destructive">{errors.placement.message as string}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>{b.placementPhoto}</Label>
            <p className="text-xs text-muted-foreground">{b.placementPhotoHint}</p>
            <ImageUploadZone
              mode="single"
              files={placementFiles}
              onChange={onPlacementFilesChange}
              label={b.uploadPlacementPhoto}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={lightboxDesign !== null}
        onOpenChange={(open) => {
          if (!open) setLightboxDesign(null);
        }}
      >
        <DialogContent
          className="max-w-[min(100vw-2rem,42rem)] gap-3 p-3 sm:p-4"
          showCloseButton
        >
          {lightboxDesign && (
            <>
              <DialogTitle className="sr-only">{lightboxDesign.title}</DialogTitle>
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={lightboxDesign.imageUrl}
                  alt={lightboxDesign.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 42rem"
                  priority
                />
              </div>
              <p className="text-center text-sm font-medium">{lightboxDesign.title}</p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function useFlashDesigns(studioSlug: string) {
  const [designs, setDesigns] = useState<PublicFlashDesign[]>([]);
  const [flashUniformPrice, setFlashUniformPrice] = useState<number | null>(null);
  const [isLoadingDesigns, setIsLoadingDesigns] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDesigns() {
      setIsLoadingDesigns(true);
      try {
        const response = await fetch(`/api/studio/${studioSlug}/flash-designs`);
        const data = await response.json();
        if (!cancelled) {
          setDesigns(data.designs ?? []);
          setFlashUniformPrice(data.flashUniformPrice ?? null);
        }
      } catch {
        if (!cancelled) {
          setDesigns([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDesigns(false);
        }
      }
    }

    void loadDesigns();
    return () => {
      cancelled = true;
    };
  }, [studioSlug]);

  return { designs, flashUniformPrice, isLoadingDesigns };
}
