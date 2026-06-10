import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/marketing/legal-page-layout";
import { TermsOfServiceContent } from "@/components/marketing/terms-of-service-content";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dict = await getDictionary(locale);

  return {
    title: dict.legal.terms.metaTitle,
    description: dict.legal.terms.metaDescription,
    robots: { index: true, follow: true },
  };
}

export default async function TermsPage() {
  const locale = await getRequestLocale();
  const dict = await getDictionary(locale);

  return (
    <LegalPageLayout dict={dict}>
      <TermsOfServiceContent />
    </LegalPageLayout>
  );
}
