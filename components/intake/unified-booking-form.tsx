"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CustomBookingSection,
  getCustomBookingDefaults,
} from "@/components/intake/custom-booking-section";
import {
  FlashBookingSection,
  useFlashDesigns,
} from "@/components/intake/flash-booking-section";
import { BookingSharedSection } from "@/components/intake/booking-shared-section";
import {
  useAppDictionary,
  useAppLocale,
} from "@/components/providers/locale-provider";
import {
  resolveFlashBookingSubmitError,
  submitFlashBooking,
} from "@/lib/intake/submit-flash-booking";
import { DEFAULT_PHONE_COUNTRY_CODE } from "@/lib/phone/country-codes";
import { compressImage, compressImages } from "@/lib/storage/compress-image";
import { uploadIntakeImage } from "@/lib/storage/upload-intake-image";
import {
  buildSocialContacts,
  createIntakeFormSchemas,
  resolveStyleValue,
} from "@/lib/validations/intake-form";
import { createFlashBookingSchema } from "@/lib/validations/flash-booking";
import type { UnifiedBookingValues } from "@/lib/validations/unified-booking";
import { TATTOO_COLOR_MODES } from "@/types/intake-form";
import type { Studio } from "@/types/studio";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type BookingTab = "custom" | "flash";

interface UnifiedBookingFormProps {
  studio: Studio;
  initialTab?: BookingTab;
}

export function UnifiedBookingForm({
  studio,
  initialTab = "custom",
}: UnifiedBookingFormProps) {
  const dict = useAppDictionary();
  const locale = useAppLocale();
  const b = dict.booking;
  const e = dict.errors;
  const f = dict.flash;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<BookingTab>(initialTab);
  const [customPlacementFiles, setCustomPlacementFiles] = useState<File[]>([]);
  const [customReferenceFiles, setCustomReferenceFiles] = useState<File[]>([]);
  const [flashPlacementFiles, setFlashPlacementFiles] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { intakeFormSchema } = useMemo(
    () => createIntakeFormSchemas(dict),
    [dict]
  );
  const flashSchema = useMemo(() => createFlashBookingSchema(dict), [dict]);

  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  const schemasRef = useRef({ intakeFormSchema, flashSchema });
  schemasRef.current = { intakeFormSchema, flashSchema };

  const defaultValues = useMemo<UnifiedBookingValues>(
    () => ({
      ...getCustomBookingDefaults(locale),
      flashDesignId: "",
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
    }),
    [locale]
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<UnifiedBookingValues>({
    resolver: ((values, context, options) => {
      const schema =
        activeTabRef.current === "custom"
          ? schemasRef.current.intakeFormSchema
          : schemasRef.current.flashSchema;
      return zodResolver(schema)(values, context, options as never);
    }) as Resolver<UnifiedBookingValues>,
    defaultValues,
  });

  const { designs, flashUniformPrice, isLoadingDesigns } = useFlashDesigns(
    studio.slug
  );

  const selectedDesignId = watch("flashDesignId");
  const selectedDesign = designs.find(
    (design) => design.designId === selectedDesignId
  );

  function handleTabChange(value: string) {
    const tab = value as BookingTab;
    setActiveTab(tab);
    clearErrors();
  }

  async function onSubmit(values: UnifiedBookingValues) {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (activeTab === "flash") {
        if (!selectedDesign || selectedDesign.price === null) {
          setSubmitError(f.priceNotSet);
          return;
        }

        const { projectId } = await submitFlashBooking({
          studioSlug: studio.slug,
          studioId: studio.studioId,
          values,
          placementFile: flashPlacementFiles[0],
          displayPrice: selectedDesign.price,
          intakeStyle: b.flashDesign,
          intakeDescription: f.flashBookingLabel,
        });

        router.push(`/${studio.slug}/p/${projectId}`);
        router.refresh();
        return;
      }

      const placementFile = customPlacementFiles[0];
      let placementPhotoUrl: string | undefined;

      if (placementFile) {
        const compressedPlacement = await compressImage(placementFile);
        placementPhotoUrl = await uploadIntakeImage(
          studio.studioId,
          compressedPlacement,
          "placement"
        );
      }

      const referenceUrls: string[] = [];
      if (customReferenceFiles.length > 0) {
        const compressedRefs = await compressImages(customReferenceFiles);
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

      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studioSlug: studio.slug,
          intakeForm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.error ?? b.submitFailed);
        return;
      }

      router.push(`/${studio.slug}/p/${data.projectId}`);
      router.refresh();
    } catch (error) {
      setSubmitError(
        activeTab === "flash"
          ? resolveFlashBookingSubmitError(error, {
              submitFailed: b.submitFailed,
              uploadFailed: b.uploadFailed,
              uploadFailedRetry: e.uploadFailedRetry,
            })
          : b.uploadFailed
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const flashSubmitDisabled =
    activeTab === "flash" &&
    (isLoadingDesigns || designs.length === 0);

  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full gap-6">
        <TabsList className="grid h-10 w-full grid-cols-2">
          <TabsTrigger value="custom">{b.customTab}</TabsTrigger>
          <TabsTrigger value="flash">{b.flashTab}</TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
        {activeTab === "custom" ? (
          <CustomBookingSection
            studio={studio}
            control={control}
            register={register}
            watch={watch}
            errors={errors}
            placementFiles={customPlacementFiles}
            onPlacementFilesChange={setCustomPlacementFiles}
            referenceFiles={customReferenceFiles}
            onReferenceFilesChange={setCustomReferenceFiles}
          />
        ) : (
          <FlashBookingSection
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            placementFiles={flashPlacementFiles}
            onPlacementFilesChange={setFlashPlacementFiles}
            designs={designs}
            flashUniformPrice={flashUniformPrice}
            isLoadingDesigns={isLoadingDesigns}
          />
        )}

        <BookingSharedSection
          studio={studio}
          control={control}
          register={register}
          watch={watch}
          errors={errors}
        />

        {submitError && (
          <p className="text-center text-sm text-destructive" role="alert">
            {submitError}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || flashSubmitDisabled}
          className="w-full"
        >
          {isSubmitting
            ? b.processingMessage
            : activeTab === "flash"
              ? f.submitFlashBooking
              : b.submitRequest}
        </Button>
      </form>
    </div>
  );
}
