import { z } from "zod";

const timeSchema = z.string().regex(/^([01]?\d|2[0-3]):([0-5]\d)$/);

const weekdaySchema = z.object({
  closed: z.boolean(),
  start: timeSchema,
  end: timeSchema,
});

export const weeklyScheduleSchema = z
  .object({
    mon: weekdaySchema.optional(),
    tue: weekdaySchema.optional(),
    wed: weekdaySchema.optional(),
    thu: weekdaySchema.optional(),
    fri: weekdaySchema.optional(),
    sat: weekdaySchema.optional(),
    sun: weekdaySchema.optional(),
  })
  .nullable()
  .optional();

export const closuresSchema = z
  .array(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      label: z.string().optional(),
    })
  )
  .optional();
