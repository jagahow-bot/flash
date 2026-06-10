import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/marketing/legal-page-layout";
import { PrivacyPolicyContent } from "@/components/marketing/privacy-policy-content";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dict = await getDictionary(locale);

  return {
    title: dict.legal.privacy.metaTitle,
    description: dict.legal.privacy.metaDescription,
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPage() {
  const locale = await getRequestLocale();
  const dict = await getDictionary(locale);

  return (
    <LegalPageLayout dict={dict}>
      <PrivacyPolicyContent />
    </LegalPageLayout>
  );
}
