import { z } from "zod";
import type { AppDictionary } from "@/lib/i18n/app-types";
import { CLIENT_GENDER_OPTIONS } from "@/lib/validations/intake-form";
import type { ClientGender } from "@/types/intake-form";
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  isValidPhoneCountryCode,
} from "@/lib/phone/country-codes";

export function createFlashBookingSchema(dict: AppDictionary) {
  const v = dict.booking.validation;
  const f = dict.flash;

  const genderSchema = z
    .string()
    .min(1, v.genderRequired)
    .refine(
      (value): value is ClientGender =>
        (CLIENT_GENDER_OPTIONS as readonly string[]).includes(value),
      { message: v.genderRequired }
    );

  const phoneCountryCodeSchema = z
    .string()
    .default(DEFAULT_PHONE_COUNTRY_CODE)
    .refine(isValidPhoneCountryCode, { message: v.countryCodeInvalid });

  return z.object({
    flashDesignId: z.string().min(1, f.designRequired),
    size: z.string().min(1, f.sizeRequired),
    placement: z.string().min(1, v.placementRequired),
    notes: z.string(),
    availability: z.array(z.string()).min(1, v.availabilityRequired),
    clientName: z.string().min(1, v.nameRequired),
    gender: genderSchema,
    phoneCountryCode: phoneCountryCodeSchema,
    phone: z.string().optional(),
    whatsappSameAsPhone: z.boolean(),
    whatsappCountryCode: phoneCountryCodeSchema.optional(),
    whatsapp: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    line: z.string().optional(),
    threads: z.string().optional(),
    ageConfirmed: z
      .boolean()
      .refine((value) => value === true, { message: v.ageRequired }),
  });
}

export type FlashBookingValues = z.input<
  ReturnType<typeof createFlashBookingSchema>
>;
