import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import type { LandingDictionary } from "@/lib/i18n/types";

export function LegalPageLayout({
  dict,
  children,
}: {
  dict: LandingDictionary;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader dict={dict} />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">{children}</div>
      </main>
      <SiteFooter dict={dict} />
    </div>
  );
}
