import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/landing-page";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildLandingMetadata } from "@/lib/i18n/metadata";

export async function getLocaleMarketingMetadata(
  locale: Locale,
): Promise<Metadata> {
  const dict = await getDictionary(locale);
  return buildLandingMetadata(locale, dict);
}

export async function renderLocaleMarketingPage(locale: Locale) {
  const dict = await getDictionary(locale);
  return <LandingPage dict={dict} />;
}
