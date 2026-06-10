import { appendRedirectToUrl } from "@/lib/auth/sanitize-redirect";
import { buildVerificationEmail } from "@/lib/email/templates/verification";
import { getAppBaseUrl } from "@/lib/email/app-url";
import { sendEmail } from "@/lib/email/send.server";
import type { Locale } from "@/lib/i18n/config";
import { getEmailDictionary } from "@/lib/i18n/dictionaries/email";
import { getAdminAuth } from "@/lib/firebase-admin";

export async function sendVerificationEmailViaResend(input: {
  email: string;
  audience: "client" | "studio";
  redirectTo?: string | null;
  locale: Locale;
}) {
  const continuePath =
    input.audience === "client" ? "/client/verify-email" : "/verify-email";
  const continueUrl = appendRedirectToUrl(
    `${getAppBaseUrl()}${continuePath}`,
    input.redirectTo
  );

  const verificationLink = await getAdminAuth().generateEmailVerificationLink(
    input.email,
    {
      url: continueUrl,
      handleCodeInApp: false,
    }
  );

  const copy = await getEmailDictionary(input.locale);
  const emailContent = buildVerificationEmail({
    locale: input.locale,
    copy,
    verificationLink,
    audience: input.audience,
  });

  return sendEmail({
    to: input.email,
    ...emailContent,
  });
}
