import type { Locale } from "@/lib/i18n/config";
import type { EmailDictionary } from "@/lib/i18n/email-types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildVerificationEmail(input: {
  locale: Locale;
  copy: EmailDictionary;
  verificationLink: string;
  audience: "client" | "studio";
}) {
  const verification = input.copy.verification;
  const title =
    input.audience === "client"
      ? verification.clientTitle
      : verification.studioTitle;
  const body =
    input.audience === "client"
      ? verification.clientBody
      : verification.studioBody;

  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(body);
  const safeLink = escapeHtml(input.verificationLink);
  const safeButton = escapeHtml(verification.buttonLabel);
  const safeFallback = escapeHtml(verification.linkFallback);
  const safeFooter = escapeHtml(verification.systemFooter);

  const html = `<!DOCTYPE html>
<html lang="${input.locale}">
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #111;">
  <div style="max-width: 560px; margin: 0 auto; padding: 24px;">
    <h1 style="font-size: 20px; margin: 0 0 16px;">${safeTitle}</h1>
    <p style="margin: 0 0 16px;">${safeBody}</p>
    <p style="margin: 24px 0;">
      <a href="${safeLink}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 6px;">${safeButton}</a>
    </p>
    <p style="font-size: 12px; color: #666;">${safeFallback}<br>${safeLink}</p>
    <p style="font-size: 12px; color: #666; margin-top: 32px;">${safeFooter}</p>
  </div>
</body>
</html>`;

  const text = `${title}\n\n${body}\n\n${verification.buttonLabel}: ${input.verificationLink}`;

  return {
    subject: `${input.copy.subjectPrefix} ${title}`,
    html,
    text,
  };
}
