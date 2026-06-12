import { buildStudioWelcomeEmail } from "@/lib/email/templates/studio-welcome";
import { sendEmail } from "@/lib/email/send.server";
import type { Locale } from "@/lib/i18n/config";
import { getEmailDictionary } from "@/lib/i18n/dictionaries/email";

export async function sendStudioWelcomeEmail(input: {
  email: string;
  studioName: string;
  studioSlug: string;
  locale: Locale;
}): Promise<void> {
  try {
    const copy = await getEmailDictionary(input.locale);
    const emailContent = buildStudioWelcomeEmail({
      locale: input.locale,
      copy,
      studioName: input.studioName,
      studioSlug: input.studioSlug,
    });

    const result = await sendEmail({
      to: input.email,
      ...emailContent,
    });

    if (!result.sent) {
      console.warn("[email] studio welcome not sent", {
        to: input.email,
        subject: emailContent.subject,
        reason: result.reason,
      });
    }
  } catch (error) {
    console.error("[email] studio welcome email failed", {
      to: input.email,
      studioSlug: input.studioSlug,
      error,
    });
  }
}
