import { SUPPORT_EMAIL } from "@/lib/email/support-email";

const legalProseClassName =
  "space-y-6 text-base leading-relaxed text-muted-foreground [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-foreground [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_p+p]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_strong]:font-medium [&_strong]:text-foreground";

export function TermsOfServiceContent() {
  return (
    <article className={legalProseClassName}>
      <header>
        <h1>Terms of Service for FLASH</h1>
        <p className="text-sm">Last updated: June 10, 2026</p>
      </header>

      <p>
        Please read these Terms of Service (&quot;Terms&quot;) carefully before
        using the FLASH platform (ink-flash.com) operated by FLASH (&quot;we,&quot;
        &quot;our,&quot; or &quot;us&quot;).
      </p>

      <section aria-labelledby="terms-acceptance">
        <h2 id="terms-acceptance">1. Acceptance of Terms</h2>
        <p>
          By accessing or using our platform, you agree to be bound by these
          Terms. If you disagree with any part of the terms, you may not access
          the service.
        </p>
      </section>

      <section aria-labelledby="terms-eligibility">
        <h2 id="terms-eligibility">2. Eligibility &amp; Age Restriction</h2>
        <p>
          Tattooing is strictly regulated globally. You must be at least 18 years
          of age to use this platform, whether as a tattoo artist, studio
          administrator, or client. By using FLASH, you represent and warrant
          that you are at least 18 years old.
        </p>
      </section>

      <section aria-labelledby="terms-responsibilities">
        <h2 id="terms-responsibilities">3. User Responsibilities</h2>
        <ul>
          <li>
            <strong>Accuracy:</strong> Users must provide accurate, current, and
            complete information during the booking and registration process.
          </li>
          <li>
            <strong>Content Ownership:</strong> You retain rights to any reference
            images or text you upload. However, you grant FLASH a license to store
            and process this data (including passing it to AI processors) solely
            to fulfill our service.
          </li>
          <li>
            <strong>Legal Compliance:</strong> Tattoo studios and artists are
            solely responsible for ensuring they comply with local licensing,
            health regulations, and parental consent laws where applicable.
          </li>
        </ul>
      </section>

      <section aria-labelledby="terms-disclaimers">
        <h2 id="terms-disclaimers">4. Disclaimers &amp; Limitation of Liability</h2>
        <ul>
          <li>
            <strong>AI Assessment:</strong> FLASH provides an AI-driven
            &quot;Virtual Manager&quot; to generate project briefs and flag
            potential risks. These insights are for reference only and do not
            replace professional artistic or medical judgment.
          </li>
          <li>
            <strong>Platform Role:</strong> FLASH is a software-as-a-service
            (SaaS) platform providing project management tools. Any contracts,
            deposits, payments, or physical tattoo procedures are strictly
            private agreements between the individual artist/studio and the
            client. FLASH is not liable for disputes arising from tattoo outcomes,
            pricing, or studio conduct.
          </li>
        </ul>
      </section>

      <section aria-labelledby="terms-termination">
        <h2 id="terms-termination">5. Termination</h2>
        <p>
          We reserve the right to terminate or suspend access to our service
          immediately, without prior notice or liability, for any reason,
          including breach of the Terms.
        </p>
      </section>

      <section aria-labelledby="terms-contact">
        <h2 id="terms-contact">6. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at:{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-foreground underline underline-offset-4 transition-colors hover:text-foreground/80"
          >
            {SUPPORT_EMAIL}
          </a>
        </p>
      </section>
    </article>
  );
}
