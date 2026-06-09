import { z } from "zod";

const dayHoursSchema = z.array(z.number().int().min(0).max(23));

export const operatingHoursSchema = z
  .object({
    mon: dayHoursSchema.optional(),
    tue: dayHoursSchema.optional(),
    wed: dayHoursSchema.optional(),
    thu: dayHoursSchema.optional(),
    fri: dayHoursSchema.optional(),
    sat: dayHoursSchema.optional(),
    sun: dayHoursSchema.optional(),
  })
  .nullable()
  .optional();
