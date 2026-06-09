"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUploadZone } from "@/components/intake/image-upload-zone";
import type { IntakeForm as IntakeFormData } from "@/types/intake-form";
import type { Studio } from "@/types/studio";
import {
  useAppDictionary,
  useAppLocale,
} from "@/components/providers/locale-provider";
import { LOCALE_DEFAULT_BUDGET_CURRENCY } from "@/lib/intake/display";
import {
  BUDGET_CURRENCIES,
  DEFAULT_SIZE_UNIT,
  SIZE_UNITS,
  TATTOO_COLOR_MODES,
} from "@/types/intake-form";
import {
  createIntakeFormSchemas,
  intakeToFormValues,
  buildSocialContacts,
  TATTOO_STYLE_PRESETS,
  CLIENT_GENDER_OPTIONS,
  resolveStyleValue,
  type IntakeFormValues,
  type IntakeFormEditValues,
} from "@/lib/validations/intake-form";
import { AvailabilityPicker } from "@/components/intake/availability-picker";
import { PhoneNumberField } from "@/components/intake/phone-number-field";
import { DEFAULT_PHONE_COUNTRY_CODE } from "@/lib/phone/country-codes";
import { cn } from "@/lib/utils";
import { compressImage, compressImages } from "@/lib/storage/compress-image";
import { uploadIntakeImage } from "@/lib/storage/upload-intake-image";
import { Button } from "@/components/ui/button";
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

interface IntakeFormProps {
  studio: Studio;
  projectId?: string;
  initialIntake?: IntakeFormData;
}

export function IntakeForm({ studio, projectId, initialIntake }: IntakeFormProps) {
  const dict = useAppDictionary();
  const locale = useAppLocale();
  const b = dict.booking;
  const { intakeFormSchema, intakeFormEditSchema } = createIntakeFormSchemas(dict);
  const router = useRouter();
  const isEdit = Boolean(projectId && initialIntake);

  const [placementFiles, setPlacementFiles] = useState<File[]>([]);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [existingPlacementUrl, setExistingPlacementUrl] = useState<
    string | undefined
  >(initialIntake?.placementPhotoUrl);
  const [existingReferenceUrls, setExistingReferenceUrls] = useState<string[]>(
    initialIntake?.referenceUrls ?? []
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IntakeFormValues | IntakeFormEditValues>({
    resolver: zodResolver(isEdit ? intakeFormEditSchema : intakeFormSchema),
    defaultValues: isEdit
      ? intakeToFormValues(initialIntake!)
      : {
          placement: "",
          size: "",
          sizeUnit: DEFAULT_SIZE_UNIT,
          stylePreset: "",
          styleOther: "",
          colorMode: "",
          description: "",
          isCoverUp: false,
          budget: "",
          budgetCurrency: LOCALE_DEFAULT_BUDGET_CURRENCY[locale],
          availability: [],
          notes: "",
          clientName: "",
          gender: "",
          phoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
          phone: "",
          whatsappSameAsPhone: true,
          whatsappCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
          whatsapp: "",
          instagram: "",
          facebook: "",
          line: "",
          threads: "",
          ageConfirmed: false,
        },
  });

  const isCoverUp = watch("isCoverUp");
  const stylePreset = watch("stylePreset");
  const whatsappSameAsPhone = watch("whatsappSameAsPhone");

  async function onSubmit(values: IntakeFormValues | IntakeFormEditValues) {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const placementFile = placementFiles[0];
      let placementPhotoUrl: string | undefined = existingPlacementUrl;

      if (placementFile) {
        const compressedPlacement = await compressImage(placementFile);
        placementPhotoUrl = await uploadIntakeImage(
          studio.studioId,
          compressedPlacement,
          "placement"
        );
      }

      const referenceUrls = [...existingReferenceUrls];
      if (referenceFiles.length > 0) {
        const compressedRefs = await compressImages(referenceFiles);
        const uploaded = await Promise.all(
          compressedRefs.map((file) =>
            uploadIntakeImage(studio.studioId, file, "references")
          )
        );
        referenceUrls.push(...uploaded);
      }

      const intakeForm = {
        placement: values.placement,
        size: values.size,
        sizeUnit: values.sizeUnit,
        style: resolveStyleValue(values),
        colorMode:
          values.colorMode &&
          (TATTOO_COLOR_MODES as readonly string[]).includes(values.colorMode)
            ? values.colorMode
            : undefined,
        description: values.description,
        isCoverUp: values.isCoverUp,
        budget: values.budget,
        budgetCurrency: values.budgetCurrency,
        availability: values.availability,
        notes: values.notes,
        socialContacts: buildSocialContacts(values),
        placementPhotoUrl,
        referenceUrls: referenceUrls.length > 0 ? referenceUrls : undefined,
      };

      const response = await fetch(
        isEdit ? `/api/intake/${projectId}` : "/api/intake",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studioSlug: studio.slug,
            intakeForm,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.error ?? b.submitFailed);
        return;
      }

      router.push(`/${studio.slug}/p/${data.projectId}`);
      router.refresh();
    } catch {
      setSubmitError(b.uploadFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? b.formTitleEdit : b.formTitle}</CardTitle>
          <CardDescription>{b.formDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="placement">{b.placement} *</Label>
              <Input id="placement" placeholder={b.placementPlaceholder} {...register("placement")} />
              {errors.placement && (
                <p className="text-sm text-destructive">{errors.placement.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="size">{b.size} *</Label>
              <div className="flex gap-2">
                <Input
                  id="size"
                  className="min-w-0 flex-1"
                  placeholder={b.sizePlaceholder}
                  {...register("size")}
                />
                <select
                  id="sizeUnit"
                  aria-label={b.sizeUnit}
                  className={cn(
                    "h-8 w-[7.5rem] shrink-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
                    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                    "dark:bg-input/30"
                  )}
                  {...register("sizeUnit")}
                >
                  {SIZE_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              {errors.size && (
                <p className="text-sm text-destructive">{errors.size.message}</p>
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
              onChange={setPlacementFiles}
              label={b.uploadPlacementPhoto}
              existingUrls={
                existingPlacementUrl ? [existingPlacementUrl] : undefined
              }
              onExistingUrlsChange={(urls) => {
                setExistingPlacementUrl(urls[0]);
                if (urls.length === 0) {
                  setPlacementFiles([]);
                }
              }}
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
                {...register("stylePreset")}
              >
                {!isEdit && (
                  <option value="" disabled>
                    {b.selectStyle}
                  </option>
                )}
                {TATTOO_STYLE_PRESETS.map((style) => (
                  <option key={style} value={style}>
                    {b.stylePresets[style] ?? style}
                  </option>
                ))}
              </select>
              {errors.stylePreset && (
                <p className="text-sm text-destructive">
                  {errors.stylePreset.message}
                </p>
              )}
              {stylePreset === TATTOO_STYLE_PRESETS[TATTOO_STYLE_PRESETS.length - 1] && (
                <div className="mt-1 flex flex-col gap-2">
                  <Input
                    id="styleOther"
                    placeholder={b.styleOtherPlaceholder}
                    {...register("styleOther")}
                  />
                  {errors.styleOther && (
                    <p className="text-sm text-destructive">
                      {errors.styleOther.message}
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
                  {...register("budgetCurrency")}
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
                  {...register("budget")}
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
                    {...register("colorMode")}
                  />
                  {b.colorModeOptions[mode] ?? mode}
                </label>
              ))}
            </div>
            {errors.colorMode && (
              <p className="text-sm text-destructive">{errors.colorMode.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">{b.description} *</Label>
            <Textarea
              id="description"
              placeholder={b.descriptionPlaceholder}
              rows={4}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>{b.referenceImages}</Label>
            <p className="text-xs text-muted-foreground">
              {b.referenceImagesHint}
            </p>
            <ImageUploadZone
              mode="multiple"
              files={referenceFiles}
              onChange={setReferenceFiles}
              label={b.uploadReference}
              hint={b.referenceUploadHint}
              existingUrls={existingReferenceUrls}
              onExistingUrlsChange={setExistingReferenceUrls}
            />
          </div>

          {studio.acceptsCoverUp && (
            <div className="flex items-center gap-2">
              <Controller
                name="isCoverUp"
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

          <div className="flex flex-col gap-2">
            <Label>{b.availability} *</Label>
            <Controller
              name="availability"
              control={control}
              render={({ field }) => (
                <AvailabilityPicker
                  operatingHours={studio.operatingHours}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.availability?.message}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">{b.notes}</Label>
            <Textarea id="notes" placeholder={b.notesPlaceholder} rows={2} {...register("notes")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{b.contactSection}</CardTitle>
          <CardDescription>{b.contactSectionDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="clientName">{b.name} *</Label>
              <Input
                id="clientName"
                placeholder={b.namePlaceholder}
                autoComplete="name"
                {...register("clientName")}
              />
              {errors.clientName && (
                <p className="text-sm text-destructive">
                  {errors.clientName.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="gender">{b.gender} *</Label>
              <select
                id="gender"
                className={cn(
                  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
                  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  "dark:bg-input/30"
                )}
                {...register("gender")}
              >
                <option value="" disabled>
                  {b.selectGender}
                </option>
                {CLIENT_GENDER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {b.genderOptions[option] ?? option}
                  </option>
                ))}
              </select>
              {errors.gender && (
                <p className="text-sm text-destructive">{errors.gender.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <PhoneNumberField
              control={control}
              register={register}
              countryCodeName="phoneCountryCode"
              phoneName="phone"
              label={b.phone}
              phoneId="phone"
              placeholder="912 345 678"
            />
            <label className="flex items-center gap-2 text-sm">
              <Controller
                name="whatsappSameAsPhone"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                )}
              />
              {b.whatsappSameAsPhone}
            </label>
            {!whatsappSameAsPhone && (
              <PhoneNumberField
                control={control}
                register={register}
                countryCodeName="whatsappCountryCode"
                phoneName="whatsapp"
                label={b.whatsapp}
                phoneId="whatsapp"
                placeholder="912 345 678"
              />
            )}
          </div>

          <div className="grid gap-4 border-t border-border/60 pt-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" placeholder="@username" {...register("instagram")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input id="facebook" placeholder={b.facebookPlaceholder} {...register("facebook")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="line">LINE ID</Label>
              <Input id="line" placeholder="line_id" {...register("line")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="threads">Threads</Label>
              <Input id="threads" placeholder="@username" {...register("threads")} />
            </div>
          </div>
        </CardContent>
      </Card>

      {!isEdit && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <Controller
                name="ageConfirmed"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                )}
              />
              <Label className="leading-relaxed font-normal">
                {b.ageConfirmLegal} *
              </Label>
            </div>
            {"ageConfirmed" in errors && errors.ageConfirmed && (
              <p className="mt-2 text-sm text-destructive">
                {errors.ageConfirmed.message}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {submitError && (
        <p className="text-center text-sm text-destructive" role="alert">
          {submitError}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        {isEdit && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full sm:flex-1"
            disabled={isSubmitting}
            onClick={() => router.push(`/${studio.slug}/p/${projectId}`)}
          >
            {dict.common.cancel}
          </Button>
        )}
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full sm:flex-1"
        >
          {isSubmitting
            ? b.processingMessage
            : isEdit
              ? b.saveUpdate
              : b.submitRequest}
        </Button>
      </div>
    </form>
  );
}
