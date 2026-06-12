import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/landing-page";
import type { Locale } from "@/lib/i18n/config";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildLandingMetadata } from "@/lib/i18n/metadata";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";

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

export async function getDefaultMarketingMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dict = await getDictionary(locale);
  return buildLandingMetadata(locale, dict);
}

export async function renderDefaultMarketingPage() {
  const locale = await getRequestLocale();
  const [dict, appDict] = await Promise.all([
    getDictionary(locale),
    getAppDictionary(locale),
  ]);

  return (
    <LandingPage
      dict={dict}
      audienceType={appDict.marketing.audienceZhHant}
    />
  );
}
