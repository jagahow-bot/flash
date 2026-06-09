import { appendRedirectToUrl } from "@/lib/auth/sanitize-redirect";
import { buildVerificationEmail } from "@/lib/email/templates/verification";
import { getAppBaseUrl } from "@/lib/email/app-url";
import { sendEmail } from "@/lib/email/send.server";
import { getAdminAuth } from "@/lib/firebase-admin";

export async function sendVerificationEmailViaResend(input: {
  email: string;
  audience: "client" | "studio";
  redirectTo?: string | null;
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

  const emailContent = buildVerificationEmail({
    verificationLink,
    audience: input.audience,
  });

  return sendEmail({
    to: input.email,
    ...emailContent,
  });
}
