import { SUPPORT_EMAIL } from "@/lib/email/support-email";

const legalProseClassName =
  "space-y-6 text-base leading-relaxed text-muted-foreground [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-foreground [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_p+p]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_strong]:font-medium [&_strong]:text-foreground";

export function PrivacyPolicyContent() {
  return (
    <article className={legalProseClassName}>
      <header>
        <h1>Privacy Policy for FLASH</h1>
        <p className="text-sm">Last updated: June 10, 2026</p>
      </header>

      <p>
        Welcome to FLASH (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We
        are committed to protecting your privacy. This Privacy Policy explains
        how we collect, use, and share information when you use our website
        (ink-flash.com) and our tattoo studio management services.
      </p>

      <section aria-labelledby="privacy-information-collected">
        <h2 id="privacy-information-collected">1. Information We Collect</h2>
        <p>
          We collect information directly from you when you fill out a tattoo
          intake form or register an account:
        </p>
        <ul>
          <li>
            <strong>Account Information:</strong> Name, email address, profile
            photos, and authentication data (via Google Auth).
          </li>
          <li>
            <strong>Tattoo Project Data:</strong> Body placement details, size
            preferences, style descriptions, budget estimates, and reference
            images uploaded to our system.
          </li>
          <li>
            <strong>Usage Data:</strong> Information about how you interact with
            our platform for performance and security monitoring.
          </li>
        </ul>
      </section>

      <section aria-labelledby="privacy-how-we-use">
        <h2 id="privacy-how-we-use">2. How We Use Your Information</h2>
        <p>
          We use the collected data to provide and improve our services,
          specifically:
        </p>
        <ul>
          <li>
            To facilitate the tattoo booking and project timeline process
            between studios and clients.
          </li>
          <li>
            To process and translate tattoo requests using secure Artificial
            Intelligence (AI) models to generate structured project briefs.
          </li>
          <li>To send automated system notifications and updates via email.</li>
        </ul>
      </section>

      <section aria-labelledby="privacy-data-sharing">
        <h2 id="privacy-data-sharing">3. Data Sharing and Third-Party Services</h2>
        <p>
          We do not sell your personal data. We only share information with
          trusted third-party service providers necessary to run our platform:
        </p>
        <ul>
          <li>
            <strong>Firebase (Google):</strong> For secure user authentication,
            cloud database storage, and file hosting.
          </li>
          <li>
            <strong>OpenAI:</strong> For converting tattoo intake descriptions
            into structured briefs. (Data sent to AI is processed securely and
            is not used for training models).
          </li>
          <li>
            <strong>Resend:</strong> For delivering transactional and
            notification emails.
          </li>
        </ul>
      </section>

      <section aria-labelledby="privacy-age-restriction">
        <h2 id="privacy-age-restriction">4. Age Restriction</h2>
        <p>
          Our services are strictly intended for individuals who are 18 years of
          age or older. We do not knowingly collect personal information from
          individuals under 18.
        </p>
      </section>

      <section aria-labelledby="privacy-your-rights">
        <h2 id="privacy-your-rights">5. Your Rights and Contact Us</h2>
        <p>
          You have the right to access, update, or request the deletion of your
          personal information at any time. For any privacy-related inquiries,
          please contact us at:{" "}
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
