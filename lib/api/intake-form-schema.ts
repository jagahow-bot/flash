import { z } from "zod";
import {
  BUDGET_CURRENCIES,
  SIZE_UNITS,
  TATTOO_COLOR_MODES,
} from "@/types/intake-form";

export const socialContactsSchema = z
  .object({
    clientName: z.string().optional(),
    gender: z.enum(["男", "女", "其他", "不願透露"]).optional(),
    phoneCountryCode: z.string().optional(),
    phone: z.string().optional(),
    whatsappCountryCode: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    whatsapp: z.string().optional(),
    line: z.string().optional(),
    threads: z.string().optional(),
  })
  .optional();

export const intakeFormBodySchema = z.object({
  placement: z.string().min(1),
  size: z.string().min(1),
  sizeUnit: z.enum(SIZE_UNITS).optional(),
  style: z.string().min(1),
  colorMode: z.enum(TATTOO_COLOR_MODES).optional(),
  description: z.string().min(1),
  isCoverUp: z.boolean(),
  budget: z.string(),
  budgetCurrency: z.enum(BUDGET_CURRENCIES).optional(),
  availability: z.array(z.string()).min(1),
  notes: z.string(),
  placementPhotoUrl: z.string().optional(),
  referenceUrls: z.array(z.string()).optional(),
  socialContacts: socialContactsSchema,
});

export function normalizeSocialContacts(
  input?: z.infer<typeof socialContactsSchema>
): z.infer<typeof socialContactsSchema> {
  if (!input) return undefined;

  const normalized = Object.fromEntries(
    Object.entries(input)
      .map(([key, value]) => [key, typeof value === "string" ? value.trim() : ""])
      .filter(([, value]) => value.length > 0)
  );

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}
