import type { IntakeFormValues } from "@/lib/validations/intake-form";

/** Combined form values when custom and flash tabs share one react-hook-form instance. */
export type UnifiedBookingValues = IntakeFormValues & {
  flashDesignId: string;
};
