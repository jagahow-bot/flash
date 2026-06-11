import { getSiteUrl } from "@/lib/i18n/site-url";
import type { Studio } from "@/types/studio";

/** Default on: protects sketch IP; studios may opt out in settings. */
export function shouldWatermarkSketches(
  studio: Pick<Studio, "watermarkSketches">
): boolean {
  return studio.watermarkSketches !== false;
}

export function getStudioBookingUrl(slug: string): string {
  const base = getSiteUrl().replace(/\/$/, "");
  return `${base}/${slug}/book`;
}
