import { Suspense } from "react";
import { ClaimPageClient } from "@/components/claim/claim-page-client";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";

export async function generateMetadata() {
  const dict = await getAppDictionary(await getRequestLocale());
  return {
    title: dict.claim.title,
    robots: { index: false, follow: false },
  };
}

export default function ClaimPage() {
  return (
    <Suspense fallback={null}>
      <ClaimPageClient />
    </Suspense>
  );
}
