import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/i18n/site-url";

export const localeLayoutMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
};
