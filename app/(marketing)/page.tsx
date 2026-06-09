import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/landing-page";
import { buildLandingMetadata } from "@/lib/i18n/metadata";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dict = await getDictionary(locale);
  return buildLandingMetadata(locale, dict);
}

export default async function MarketingPage() {
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
