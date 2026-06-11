import { z } from "zod";

export const flashDesignBodySchema = z.object({
  title: z.string().min(1),
  imageUrl: z.string().url(),
  price: z.number().min(0).nullable().optional(),
  allowedSizes: z.array(z.string().min(1)).min(1),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const flashDesignUpdateSchema = flashDesignBodySchema.partial();

export const flashSettingsSchema = z.object({
  flashBookingEnabled: z.boolean().optional(),
  flashUniformPrice: z.number().min(0).nullable().optional(),
});
