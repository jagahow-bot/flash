"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookingSharedSection } from "@/components/intake/booking-shared-section";
import {
  FlashBookingSection,
  useFlashDesigns,
} from "@/components/intake/flash-booking-section";
import { useAppDictionary } from "@/components/providers/locale-provider";
import {
  resolveFlashBookingSubmitError,
  submitFlashBooking,
} from "@/lib/intake/submit-flash-booking";
import { DEFAULT_PHONE_COUNTRY_CODE } from "@/lib/phone/country-codes";
import {
  createFlashBookingSchema,
  type FlashBookingValues,
} from "@/lib/validations/flash-booking";
import type { Studio } from "@/types/studio";
import { Button } from "@/components/ui/button";

interface FlashBookingFormProps {
  studio: Studio;
}

export function FlashBookingForm({ studio }: FlashBookingFormProps) {
  const dict = useAppDictionary();
  const b = dict.booking;
  const e = dict.errors;
  const f = dict.flash;
  const router = useRouter();
  const schema = useMemo(() => createFlashBookingSchema(dict), [dict]);

  const [placementFiles, setPlacementFiles] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { designs, flashUniformPrice, isLoadingDesigns } = useFlashDesigns(
    studio.slug
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FlashBookingValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      flashDesignId: "",
      size: "",
      placement: "",
      notes: "",
      availability: [],
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

  const selectedDesignId = watch("flashDesignId");
  const selectedDesign = designs.find(
    (design) => design.designId === selectedDesignId
  );

  async function onSubmit(values: FlashBookingValues) {
    if (!selectedDesign || selectedDesign.price === null) {
      setSubmitError(f.priceNotSet);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const { projectId } = await submitFlashBooking({
        studioSlug: studio.slug,
        studioId: studio.studioId,
        values,
        placementFile: placementFiles[0],
        displayPrice: selectedDesign.price,
        intakeStyle: b.flashDesign,
        intakeDescription: f.flashBookingLabel,
      });

      router.push(`/${studio.slug}/p/${projectId}`);
      router.refresh();
    } catch (error) {
      setSubmitError(
        resolveFlashBookingSubmitError(error, {
          submitFailed: b.submitFailed,
          uploadFailed: b.uploadFailed,
          uploadFailedRetry: e.uploadFailedRetry,
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
      <FlashBookingSection
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
        placementFiles={placementFiles}
        onPlacementFilesChange={setPlacementFiles}
        designs={designs}
        flashUniformPrice={flashUniformPrice}
        isLoadingDesigns={isLoadingDesigns}
      />

      {designs.length > 0 && (
        <BookingSharedSection
          studio={studio}
          control={control}
          register={register}
          watch={watch}
          errors={errors}
        />
      )}

      {submitError && (
        <p className="text-center text-sm text-destructive" role="alert">
          {submitError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting || designs.length === 0}
        className="w-full"
      >
        {isSubmitting ? b.processingMessage : f.submitFlashBooking}
      </Button>
    </form>
  );
}
