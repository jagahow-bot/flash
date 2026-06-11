"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { ImageUploadZone } from "@/components/intake/image-upload-zone";
import { formatMessage } from "@/lib/i18n/format";
import { compressImage } from "@/lib/storage/compress-image";
import { uploadFlashDesignImage } from "@/lib/storage/upload-flash-design";
import type { FlashDesign } from "@/types/flash-design";
import type { Studio } from "@/types/studio";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
interface DesignDraft {
  designId?: string;
  title: string;
  imageUrl: string;
  price: string;
  useUniformPrice: boolean;
  allowedSizes: string[];
  newSize: string;
  active: boolean;
  sortOrder: number;
  imageFiles: File[];
  isNew: boolean;
}

function designToDraft(design: FlashDesign): DesignDraft {
  return {
    designId: design.designId,
    title: design.title,
    imageUrl: design.imageUrl,
    price: design.price !== null ? String(design.price) : "",
    useUniformPrice: design.price === null,
    allowedSizes: [...design.allowedSizes],
    newSize: "",
    active: design.active,
    sortOrder: design.sortOrder,
    imageFiles: [],
    isNew: false,
  };
}

function createEmptyDraft(sortOrder: number): DesignDraft {
  return {
    title: "",
    imageUrl: "",
    price: "",
    useUniformPrice: true,
    allowedSizes: [],
    newSize: "",
    active: true,
    sortOrder,
    imageFiles: [],
    isNew: true,
  };
}

export function FlashDesignsManager({ studio }: { studio: Studio }) {
  const dict = useAppDictionary();
  const f = dict.flash;
  const c = dict.common;
  const router = useRouter();

  const [flashBookingEnabled, setFlashBookingEnabled] = useState(
    studio.flashBookingEnabled === true
  );
  const [flashUniformPrice, setFlashUniformPrice] = useState(
    studio.flashUniformPrice != null ? String(studio.flashUniformPrice) : ""
  );
  const [drafts, setDrafts] = useState<DesignDraft[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [savingDesignId, setSavingDesignId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDesigns() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/studio/flash-designs");
        const data = await response.json();
        if (!cancelled) {
          const designs = (data.designs ?? []) as FlashDesign[];
          setDrafts(designs.map(designToDraft));
        }
      } catch {
        if (!cancelled) {
          setDrafts([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDesigns();
    return () => {
      cancelled = true;
    };
  }, []);

  function getDraftKey(draft: DesignDraft): string {
    return draft.designId ?? `new-${draft.sortOrder}`;
  }

  function updateDraft(draftKey: string, patch: Partial<DesignDraft>) {
    setDrafts((prev) =>
      prev.map((draft) =>
        getDraftKey(draft) === draftKey ? { ...draft, ...patch } : draft
      )
    );
  }

  async function saveSettings() {
    setError(null);
    setSuccessMessage(null);
    setIsSavingSettings(true);

    try {
      const parsedUniform =
        flashUniformPrice.trim() === ""
          ? null
          : Number(flashUniformPrice);

      if (
        parsedUniform !== null &&
        (!Number.isFinite(parsedUniform) || parsedUniform < 0)
      ) {
        setError(f.invalidUniformPrice);
        return;
      }

      const response = await fetch("/api/studio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashBookingEnabled,
          flashUniformPrice: parsedUniform,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? dict.errors.updateFailed);
        return;
      }

      setSuccessMessage(f.settingsSaved);
      router.refresh();
    } catch {
      setError(dict.errors.updateFailed);
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function saveDesign(draft: DesignDraft) {
    const key = getDraftKey(draft);
    setSavingDesignId(key);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!draft.title.trim()) {
        setError(f.titleRequired);
        return;
      }

      if (!draft.imageUrl && draft.imageFiles.length === 0) {
        setError(f.uploadRequired);
        return;
      }

      if (draft.allowedSizes.length === 0) {
        setError(f.sizesRequired);
        return;
      }

      let imageUrl = draft.imageUrl;
      if (draft.imageFiles.length > 0) {
        const compressed = await compressImage(draft.imageFiles[0]);
        imageUrl = await uploadFlashDesignImage(studio.studioId, compressed);
      }

      const price = draft.useUniformPrice
        ? null
        : draft.price.trim() === ""
          ? null
          : Number(draft.price);

      if (!draft.useUniformPrice && (price === null || !Number.isFinite(price))) {
        setError(f.invalidPrice);
        return;
      }

      const payload = {
        title: draft.title.trim(),
        imageUrl,
        price,
        allowedSizes: draft.allowedSizes,
        active: draft.active,
        sortOrder: draft.sortOrder,
      };

      const response = await fetch(
        draft.isNew
          ? "/api/studio/flash-designs"
          : `/api/studio/flash-designs/${draft.designId}`,
        {
          method: draft.isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      let data: { error?: string; design?: FlashDesign } = {};
      try {
        data = (await response.json()) as typeof data;
      } catch {
        // Non-JSON error responses fall back to status-based messaging below.
      }

      if (!response.ok) {
        setError(data.error ?? dict.errors.updateFailed);
        return;
      }

      const saved = data.design as FlashDesign;
      setDrafts((prev) =>
        prev.map((item) =>
          getDraftKey(item) === key ? designToDraft(saved) : item
        )
      );
      setSuccessMessage(f.designSaved);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.updateFailed);
    } finally {
      setSavingDesignId(null);
    }
  }

  async function deleteDesign(draft: DesignDraft) {
    if (draft.isNew) {
      setDrafts((prev) => prev.filter((item) => getDraftKey(item) !== getDraftKey(draft)));
      return;
    }

    if (!window.confirm(f.deleteConfirm)) return;

    setError(null);
    try {
      const response = await fetch(
        `/api/studio/flash-designs/${draft.designId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? dict.errors.updateFailed);
        return;
      }

      setDrafts((prev) =>
        prev.filter((item) => item.designId !== draft.designId)
      );
      router.refresh();
    } catch {
      setError(dict.errors.updateFailed);
    }
  }

  function moveDesign(draft: DesignDraft, direction: -1 | 1) {
    setDrafts((prev) => {
      const index = prev.findIndex((item) => getDraftKey(item) === getDraftKey(draft));
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.length) return prev;

      const next = [...prev];
      const [removed] = next.splice(index, 1);
      next.splice(target, 0, removed);
      return next.map((item, sortOrder) => ({ ...item, sortOrder }));
    });
  }

  function addDesign() {
    setDrafts((prev) => [...prev, createEmptyDraft(prev.length)]);
    setExpandedId(`new-${drafts.length}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{f.settingsTitle}</CardTitle>
        <CardDescription>{f.settingsDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-lg border p-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={flashBookingEnabled}
              onCheckedChange={(checked) =>
                setFlashBookingEnabled(checked === true)
              }
            />
            {f.enableBooking}
          </label>
          <p className="text-xs text-muted-foreground">{f.enableBookingHint}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="flashUniformPrice">{f.uniformPriceLabel}</Label>
              <Input
                id="flashUniformPrice"
                type="number"
                min={0}
                placeholder={f.uniformPricePlaceholder}
                value={flashUniformPrice}
                onChange={(event) => setFlashUniformPrice(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {f.uniformPriceHint}
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => void saveSettings()}
            disabled={isSavingSettings}
          >
            {isSavingSettings ? c.saving : f.saveSettings}
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">{f.designListTitle}</p>
          <Button type="button" variant="outline" size="sm" onClick={addDesign}>
            <Plus className="mr-1 size-4" aria-hidden />
            {f.addDesign}
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">{c.loading}</p>
        ) : drafts.length === 0 ? (
          <p className="text-sm text-muted-foreground">{f.noDesigns}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {drafts.map((draft, index) => {
              const key = getDraftKey(draft);
              const isExpanded = expandedId === key;

              return (
                <div key={key} className="rounded-lg border">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 p-3 text-left"
                    onClick={() => setExpandedId(isExpanded ? null : key)}
                  >
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      {draft.imageUrl ? (
                        <Image
                          src={draft.imageUrl}
                          alt={draft.title || f.designTitle}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {draft.title || f.untitledDesign}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {draft.active ? f.active : f.inactive}
                        {draft.useUniformPrice
                          ? ` · ${f.usesUniformPrice}`
                          : draft.price
                            ? ` · ${formatMessage(c.priceFormat, {
                                amount: Number(draft.price),
                              })}`
                            : ""}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="size-4 shrink-0" aria-hidden />
                    ) : (
                      <ChevronDown className="size-4 shrink-0" aria-hidden />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="flex flex-col gap-4 border-t p-4">
                      <div className="flex flex-col gap-2">
                        <Label>{f.designTitle}</Label>
                        <Input
                          value={draft.title}
                          placeholder={f.designTitlePlaceholder}
                          onChange={(event) =>
                            updateDraft(key, { title: event.target.value })
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label>{f.designImage}</Label>
                        {draft.imageUrl ? (
                          <div className="relative aspect-video max-w-xs overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={draft.imageUrl}
                              alt={draft.title}
                              fill
                              className="object-contain"
                              sizes="320px"
                            />
                          </div>
                        ) : null}
                        <ImageUploadZone
                          mode="single"
                          files={draft.imageFiles}
                          onChange={(files) =>
                            updateDraft(key, { imageFiles: files })
                          }
                          label={f.uploadImage}
                        />
                      </div>

                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={draft.useUniformPrice}
                          onCheckedChange={(checked) =>
                            updateDraft(key, { useUniformPrice: checked === true })
                          }
                        />
                        {f.useUniformPrice}
                      </label>

                      {!draft.useUniformPrice && (
                        <div className="flex flex-col gap-2">
                          <Label>{f.designPrice}</Label>
                          <Input
                            type="number"
                            min={0}
                            value={draft.price}
                            placeholder={f.designPricePlaceholder}
                            onChange={(event) =>
                              updateDraft(key, { price: event.target.value })
                            }
                          />
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        <Label>{f.allowedSizes}</Label>
                        <p className="text-xs text-muted-foreground">
                          {f.allowedSizesHint}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {draft.allowedSizes.map((size) => (
                            <span
                              key={size}
                              className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"
                            >
                              {size}
                              <button
                                type="button"
                                className="text-muted-foreground hover:text-foreground"
                                onClick={() =>
                                  updateDraft(key, {
                                    allowedSizes: draft.allowedSizes.filter(
                                      (item) => item !== size
                                    ),
                                  })
                                }
                                aria-label={c.removeAria}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={draft.newSize}
                            placeholder={f.sizePlaceholder}
                            onChange={(event) =>
                              updateDraft(key, { newSize: event.target.value })
                            }
                            onKeyDown={(event) => {
                              if (event.key !== "Enter") return;
                              event.preventDefault();
                              const size = draft.newSize.trim();
                              if (!size || draft.allowedSizes.includes(size)) {
                                return;
                              }
                              updateDraft(key, {
                                allowedSizes: [...draft.allowedSizes, size],
                                newSize: "",
                              });
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const size = draft.newSize.trim();
                              if (!size || draft.allowedSizes.includes(size)) {
                                return;
                              }
                              updateDraft(key, {
                                allowedSizes: [...draft.allowedSizes, size],
                                newSize: "",
                              });
                            }}
                          >
                            {f.addSize}
                          </Button>
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={draft.active}
                          onCheckedChange={(checked) =>
                            updateDraft(key, { active: checked === true })
                          }
                        />
                        {f.active}
                      </label>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={index === 0}
                          onClick={() => moveDesign(draft, -1)}
                          aria-label={c.moveUpAria}
                        >
                          <ChevronUp className="size-4" aria-hidden />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={index === drafts.length - 1}
                          onClick={() => moveDesign(draft, 1)}
                          aria-label={c.moveDownAria}
                        >
                          <ChevronDown className="size-4" aria-hidden />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void deleteDesign(draft)}
                        >
                          <Trash2 className="mr-1 size-4" aria-hidden />
                          {f.deleteDesign}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="ml-auto"
                          disabled={savingDesignId === key}
                          onClick={() => void saveDesign(draft)}
                        >
                          {savingDesignId === key ? c.saving : f.saveDesign}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {successMessage && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            {successMessage}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
