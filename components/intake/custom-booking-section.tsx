"use client";

import type {
  Control,
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import { ImageUploadZone } from "@/components/intake/image-upload-zone";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { LOCALE_DEFAULT_BUDGET_CURRENCY } from "@/lib/intake/display";
import {
  BUDGET_CURRENCIES,
  DEFAULT_SIZE_UNIT,
  SIZE_UNITS,
  TATTOO_COLOR_MODES,
} from "@/types/intake-form";
import {
  TATTOO_STYLE_PRESETS,
  type IntakeFormValues,
} from "@/lib/validations/intake-form";
import type { Studio } from "@/types/studio";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CustomBookingSectionProps<T extends FieldValues> {
  studio: Studio;
  control: Control<T>;
  register: UseFormRegister<T>;
  watch: UseFormWatch<T>;
  errors: FieldErrors<T>;
  placementFiles: File[];
  onPlacementFilesChange: (files: File[]) => void;
  referenceFiles: File[];
  onReferenceFilesChange: (files: File[]) => void;
}

export function CustomBookingSection<T extends FieldValues>({
  studio,
  control,
  register,
  watch,
  errors,
  placementFiles,
  onPlacementFilesChange,
  referenceFiles,
  onReferenceFilesChange,
}: CustomBookingSectionProps<T>) {
  const dict = useAppDictionary();
  const b = dict.booking;

  const isCoverUp = watch("isCoverUp" as Path<T>);
  const stylePreset = watch("stylePreset" as Path<T>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{b.formTitle}</CardTitle>
        <CardDescription>{b.formDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="placement">{b.placement} *</Label>
            <Input
              id="placement"
              placeholder={b.placementPlaceholder}
              {...register("placement" as Path<T>)}
            />
            {errors.placement && (
              <p className="text-sm text-destructive">{errors.placement.message as string}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="size">{b.size} *</Label>
            <div className="flex gap-2">
              <Input
                id="size"
                className="min-w-0 flex-1"
                placeholder={b.sizePlaceholder}
                {...register("size" as Path<T>)}
              />
              <select
                id="sizeUnit"
                aria-label={b.sizeUnit}
                className={cn(
                  "h-8 w-[7.5rem] shrink-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
                  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  "dark:bg-input/30"
                )}
                {...register("sizeUnit" as Path<T>)}
              >
                {SIZE_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            {errors.size && (
              <p className="text-sm text-destructive">{errors.size.message as string}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>{b.placementPhoto}</Label>
          <p className="text-xs text-muted-foreground">
            {b.placementPhotoHintExtended}
          </p>
          <ImageUploadZone
            mode="single"
            files={placementFiles}
            onChange={onPlacementFilesChange}
            label={b.uploadPlacementPhoto}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="stylePreset">{b.style} *</Label>
            <select
              id="stylePreset"
              className={cn(
                "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                "dark:bg-input/30"
              )}
              {...register("stylePreset" as Path<T>)}
            >
              <option value="" disabled>
                {b.selectStyle}
              </option>
              {TATTOO_STYLE_PRESETS.map((style) => (
                <option key={style} value={style}>
                  {b.stylePresets[style] ?? style}
                </option>
              ))}
            </select>
            {errors.stylePreset && (
              <p className="text-sm text-destructive">
                {errors.stylePreset.message as string}
              </p>
            )}
            {stylePreset === TATTOO_STYLE_PRESETS[TATTOO_STYLE_PRESETS.length - 1] && (
              <div className="mt-1 flex flex-col gap-2">
                <Input
                  id="styleOther"
                  placeholder={b.styleOtherPlaceholder}
                  {...register("styleOther" as Path<T>)}
                />
                {errors.styleOther && (
                  <p className="text-sm text-destructive">
                    {errors.styleOther.message as string}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="budget">{b.budget}</Label>
            <div className="flex gap-2">
              <select
                id="budgetCurrency"
                aria-label={b.budgetCurrency}
                className={cn(
                  "h-8 w-[8.5rem] shrink-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
                  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  "dark:bg-input/30"
                )}
                {...register("budgetCurrency" as Path<T>)}
              >
                {BUDGET_CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {b.budgetCurrencies[currency] ?? currency}
                  </option>
                ))}
              </select>
              <Input
                id="budget"
                className="min-w-0 flex-1"
                placeholder={b.budgetPlaceholder}
                {...register("budget" as Path<T>)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>{b.colorMode} *</Label>
          <div className="flex flex-wrap gap-4">
            {TATTOO_COLOR_MODES.map((mode) => (
              <label key={mode} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  value={mode}
                  className="size-4 accent-primary"
                  {...register("colorMode" as Path<T>)}
                />
                {b.colorModeOptions[mode] ?? mode}
              </label>
            ))}
          </div>
          {errors.colorMode && (
            <p className="text-sm text-destructive">{errors.colorMode.message as string}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">{b.description} *</Label>
          <Textarea
            id="description"
            placeholder={b.descriptionPlaceholder}
            rows={4}
              {...register("description" as Path<T>)}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message as string}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label>{b.referenceImages}</Label>
          <p className="text-xs text-muted-foreground">{b.referenceImagesHint}</p>
          <ImageUploadZone
            mode="multiple"
            files={referenceFiles}
            onChange={onReferenceFilesChange}
            label={b.uploadReference}
            hint={b.referenceUploadHint}
          />
        </div>

        {studio.acceptsCoverUp && (
          <div className="flex items-center gap-2">
            <Controller
              name={"isCoverUp" as Path<T>}
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              )}
            />
            <Label>{b.coverUp}</Label>
          </div>
        )}

        {isCoverUp && (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            {b.coverUpWarning}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function getCustomBookingDefaults(
  locale: string
): Pick<
  IntakeFormValues,
  | "placement"
  | "size"
  | "sizeUnit"
  | "stylePreset"
  | "styleOther"
  | "colorMode"
  | "description"
  | "isCoverUp"
  | "budget"
  | "budgetCurrency"
> {
  return {
    placement: "",
    size: "",
    sizeUnit: DEFAULT_SIZE_UNIT,
    stylePreset: "",
    styleOther: "",
    colorMode: "",
    description: "",
    isCoverUp: false,
    budget: "",
    budgetCurrency:
      LOCALE_DEFAULT_BUDGET_CURRENCY[
        locale as keyof typeof LOCALE_DEFAULT_BUDGET_CURRENCY
      ] ?? "TWD",
  };
}
