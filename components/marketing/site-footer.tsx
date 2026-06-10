import Link from "next/link";
import type { LandingDictionary } from "@/lib/i18n/types";
import { SUPPORT_EMAIL } from "@/lib/email/support-email";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";

export function SiteFooter({ dict }: { dict: LandingDictionary }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30" aria-label="Site footer">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-semibold tracking-tight">FLASH</p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              {dict.footer.tagline}
            </p>
            <div className="mt-4">
              <LanguageSwitcher dict={dict} />
            </div>
          </div>

          <nav aria-label={dict.footer.account}>
            <p className="text-sm font-medium">{dict.footer.account}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/login"
                  prefetch={false}
                  className="transition-colors hover:text-foreground"
                >
                  {dict.footer.login}
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  prefetch={false}
                  className="transition-colors hover:text-foreground"
                >
                  {dict.footer.studioRegister}
                </Link>
              </li>
              <li>
                <Link
                  href="/client/my-projects"
                  className="transition-colors hover:text-foreground"
                >
                  {dict.footer.myProjects}
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label={dict.footer.product}>
            <p className="text-sm font-medium">{dict.footer.product}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="#features"
                  className="transition-colors hover:text-foreground"
                >
                  {dict.features.title}
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="transition-colors hover:text-foreground"
                >
                  {dict.howItWorks.title}
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="transition-colors hover:text-foreground"
                >
                  {dict.faq.title}
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label={dict.footer.legal}>
            <p className="text-sm font-medium">{dict.footer.legal}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/privacy"
                  prefetch={false}
                  className="transition-colors hover:text-foreground"
                >
                  {dict.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  prefetch={false}
                  className="transition-colors hover:text-foreground"
                >
                  {dict.footer.termsOfService}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          <p>
            {dict.footer.contactSupportPrefix}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="transition-colors hover:text-foreground"
            >
              {SUPPORT_EMAIL}
            </a>
            {dict.footer.contactSupportSuffix}
          </p>
          <p className="mt-2">
            © {year} FLASH. {dict.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
