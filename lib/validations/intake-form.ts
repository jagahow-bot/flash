import { normalizeAvailabilitySelection } from "@/lib/availability/slots";
import type { AppDictionary } from "@/lib/i18n/app-types";
import defaultAppDict from "@/lib/i18n/dictionaries/app/zh-Hant";
import { z } from "zod";
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  isValidPhoneCountryCode,
} from "@/lib/phone/country-codes";
import {
  formatInternationalPhone,
  parseInternationalPhone,
  phonesMatch,
  splitStoredPhone,
} from "@/lib/phone/format";
import {
  BUDGET_CURRENCIES,
  DEFAULT_BUDGET_CURRENCY,
  DEFAULT_SIZE_UNIT,
  SIZE_UNITS,
  type BudgetCurrency,
  type ClientGender,
  TATTOO_COLOR_MODES,
  type IntakeForm,
  type SizeUnit,
} from "@/types/intake-form";

export const TATTOO_STYLE_PRESETS = [
  "細線",
  "寫實",
  "日式傳統",
  "美式傳統",
  "幾何圖騰",
  "其它",
] as const;

export type TattooStylePreset = (typeof TATTOO_STYLE_PRESETS)[number];

export const CLIENT_GENDER_OPTIONS = [
  "男",
  "女",
  "其他",
  "不願透露",
] as const satisfies readonly ClientGender[];

export function createIntakeFormSchemas(dict: AppDictionary) {
  const v = dict.booking.validation;

  const genderSchema = z
    .string()
    .min(1, v.genderRequired)
    .refine(
      (value): value is ClientGender =>
        (CLIENT_GENDER_OPTIONS as readonly string[]).includes(value),
      { message: v.genderRequired },
    );

  const phoneCountryCodeSchema = z
    .string()
    .default(DEFAULT_PHONE_COUNTRY_CODE)
    .refine(isValidPhoneCountryCode, { message: v.countryCodeInvalid });

  const intakeFieldsSchema = z
    .object({
      placement: z.string().min(1, v.placementRequired),
      size: z.string().min(1, v.sizeRequired),
      sizeUnit: z
        .enum(SIZE_UNITS)
        .default(DEFAULT_SIZE_UNIT),
      budgetCurrency: z
        .enum(BUDGET_CURRENCIES)
        .default(DEFAULT_BUDGET_CURRENCY),
      stylePreset: z
        .string()
        .min(1, v.styleRequired)
        .refine(
          (value): value is TattooStylePreset =>
            (TATTOO_STYLE_PRESETS as readonly string[]).includes(value),
          { message: v.styleRequired },
        ),
      styleOther: z.string(),
      colorMode: z
        .union([z.enum(TATTOO_COLOR_MODES), z.literal("")])
        .optional(),
      description: z.string().min(10, v.descriptionMin),
      isCoverUp: z.boolean(),
      budget: z.string(),
      availability: z.array(z.string()).min(1, v.availabilityRequired),
      notes: z.string(),
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
    })
    .superRefine((data, ctx) => {
      if (data.stylePreset === "其它" && data.styleOther.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: v.styleOtherRequired,
          path: ["styleOther"],
        });
      }
    });

  const intakeFormSchema = intakeFieldsSchema
    .extend({
      ageConfirmed: z
        .boolean()
        .refine((value) => value === true, { message: v.ageRequired }),
    })
    .superRefine((data, ctx) => {
      if (
        !data.colorMode ||
        !(TATTOO_COLOR_MODES as readonly string[]).includes(data.colorMode)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: v.colorModeRequired,
          path: ["colorMode"],
        });
      }
    });

  return { intakeFormSchema, intakeFormEditSchema: intakeFieldsSchema };
}

const defaultSchemas = createIntakeFormSchemas(defaultAppDict);

export const intakeFormSchema = defaultSchemas.intakeFormSchema;

export type IntakeFormValues = z.input<typeof intakeFormSchema>;

/** 編輯既有專案時使用（不需再次勾選年齡確認） */
export const intakeFormEditSchema = defaultSchemas.intakeFormEditSchema;

export type IntakeFormEditValues = z.input<typeof intakeFormEditSchema>;

function splitWhatsappForForm(
  storedWhatsapp: string,
  fallbackCountryCode: string
): { countryCode: string; national: string } {
  const parsed = parseInternationalPhone(storedWhatsapp);
  if (parsed) {
    return parsed;
  }

  return {
    countryCode: fallbackCountryCode,
    national: storedWhatsapp,
  };
}

export function intakeToFormValues(intake: IntakeForm): IntakeFormEditValues {
  const isPreset = (TATTOO_STYLE_PRESETS as readonly string[]).includes(
    intake.style
  );

  const storedWhatsapp = intake.socialContacts?.whatsapp ?? "";
  const phoneParts = splitStoredPhone(
    intake.socialContacts?.phoneCountryCode,
    intake.socialContacts?.phone ?? (storedWhatsapp || undefined)
  );
  const phoneInternational = formatInternationalPhone(
    phoneParts.countryCode,
    phoneParts.national
  );
  const whatsappSameAsPhone = Boolean(
    phoneInternational &&
      (!storedWhatsapp || phonesMatch(phoneInternational, storedWhatsapp))
  );
  const whatsappParts = whatsappSameAsPhone
    ? { countryCode: phoneParts.countryCode, national: "" }
    : splitWhatsappForForm(
        storedWhatsapp,
        intake.socialContacts?.whatsappCountryCode ?? phoneParts.countryCode
      );

  return {
    placement: intake.placement,
    size: intake.size,
    sizeUnit: (intake.sizeUnit ?? DEFAULT_SIZE_UNIT) as SizeUnit,
    stylePreset: isPreset ? (intake.style as TattooStylePreset) : "其它",
    styleOther: isPreset ? "" : intake.style,
    colorMode: intake.colorMode ?? "",
    description: intake.description,
    isCoverUp: intake.isCoverUp,
    budget: intake.budget,
    budgetCurrency: (intake.budgetCurrency ?? DEFAULT_BUDGET_CURRENCY) as BudgetCurrency,
    availability: normalizeAvailabilitySelection(intake.availability),
    notes: intake.notes,
    clientName: intake.socialContacts?.clientName ?? "",
    gender:
      intake.socialContacts?.gender &&
      (CLIENT_GENDER_OPTIONS as readonly string[]).includes(
        intake.socialContacts.gender
      )
        ? intake.socialContacts.gender
        : "",
    phoneCountryCode: phoneParts.countryCode,
    phone: phoneParts.national,
    whatsappSameAsPhone,
    whatsappCountryCode: whatsappParts.countryCode,
    whatsapp: whatsappParts.national,
    instagram: intake.socialContacts?.instagram ?? "",
    facebook: intake.socialContacts?.facebook ?? "",
    line: intake.socialContacts?.line ?? "",
    threads: intake.socialContacts?.threads ?? "",
  };
}

export function buildSocialContacts(
  values: Pick<
    IntakeFormEditValues,
    | "clientName"
    | "gender"
    | "phoneCountryCode"
    | "phone"
    | "whatsappSameAsPhone"
    | "whatsappCountryCode"
    | "whatsapp"
    | "instagram"
    | "facebook"
    | "line"
    | "threads"
  >
) {
  const phoneCountryCode =
    values.phoneCountryCode?.trim() || DEFAULT_PHONE_COUNTRY_CODE;
  const nationalPhone = values.phone?.trim();
  const phoneInternational = nationalPhone
    ? formatInternationalPhone(phoneCountryCode, nationalPhone)
    : "";

  const whatsappCountryCode =
    values.whatsappCountryCode?.trim() || phoneCountryCode;
  const whatsapp = values.whatsappSameAsPhone
    ? phoneInternational
    : formatInternationalPhone(whatsappCountryCode, values.whatsapp?.trim() ?? "");

  const socialContacts = {
    clientName: values.clientName?.trim(),
    gender: values.gender,
    phoneCountryCode: nationalPhone ? phoneCountryCode : undefined,
    phone: nationalPhone,
    whatsappCountryCode:
      !values.whatsappSameAsPhone && values.whatsapp?.trim()
        ? whatsappCountryCode
        : undefined,
    whatsapp,
    instagram: values.instagram?.trim(),
    facebook: values.facebook?.trim(),
    line: values.line?.trim(),
    threads: values.threads?.trim(),
  };

  const filtered = Object.fromEntries(
    Object.entries(socialContacts).filter(([, value]) => value)
  );

  return Object.keys(filtered).length > 0 ? filtered : undefined;
}

export function resolveStyleValue(
  values: IntakeFormValues | IntakeFormEditValues
): string {
  if (values.stylePreset === "其它") {
    return values.styleOther.trim();
  }
  return values.stylePreset;
}
