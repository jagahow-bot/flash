import { buildStudioOutreachEmail } from "@/lib/email/templates/studio-outreach";
import { sendEmail } from "@/lib/email/send.server";
import type { Locale } from "@/lib/i18n/config";
import { getEmailDictionary } from "@/lib/i18n/dictionaries/email";

export async function sendStudioOutreachEmail(input: {
  email: string;
  studioName: string;
  studioSlug: string;
  claimUrl: string;
  locale: Locale;
}): Promise<void> {
  try {
    const copy = await getEmailDictionary(input.locale);
    const emailContent = buildStudioOutreachEmail({
      locale: input.locale,
      copy,
      studioName: input.studioName,
      studioSlug: input.studioSlug,
      claimUrl: input.claimUrl,
    });

    const result = await sendEmail({
      to: input.email,
      ...emailContent,
    });

    if (!result.sent) {
      console.warn("[email] studio outreach not sent", {
        to: input.email,
        subject: emailContent.subject,
        reason: result.reason,
      });
    }
  } catch (error) {
    console.error("[email] studio outreach email failed", {
      to: input.email,
      studioSlug: input.studioSlug,
      error,
    });
  }
}
