import { getAppBaseUrl } from "@/lib/email/app-url";
import type { Locale } from "@/lib/i18n/config";
import type { EmailDictionary } from "@/lib/i18n/email-types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function replaceTokens(
  value: string,
  tokens: Record<string, string>,
): string {
  let result = value;
  for (const [key, tokenValue] of Object.entries(tokens)) {
    result = result.replaceAll(`{${key}}`, tokenValue);
  }
  return result;
}

export function buildStudioOutreachEmail(input: {
  locale: Locale;
  copy: EmailDictionary;
  studioName: string;
  studioSlug: string;
  claimUrl: string;
}) {
  const outreach = input.copy.studioOutreach;
  if (!outreach) {
    throw new Error("studioOutreach email copy is not configured");
  }
  const baseUrl = getAppBaseUrl();
  const previewUrl = `${baseUrl.replace(/\/$/, "")}/preview/dashboard`;

  const tokens = {
    studioName: input.studioName,
    claimUrl: input.claimUrl,
    previewUrl,
  };

  const title = outreach.title;
  const body = replaceTokens(outreach.body, tokens);
  const ctaTitle = outreach.ctaTitle;
  const ctaBody = replaceTokens(outreach.ctaBody, tokens);

  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(body);
  const safeCtaTitle = escapeHtml(ctaTitle);
  const safeCtaBody = escapeHtml(ctaBody);
  const safeClaimLabel = escapeHtml(outreach.claimButton);
  const safePreviewLabel = escapeHtml(outreach.previewButton);
  const safeClaimUrl = escapeHtml(input.claimUrl);
  const safePreviewUrl = escapeHtml(previewUrl);
  const safeFooter = escapeHtml(input.copy.footerNotice);

  const html = `<!DOCTYPE html>
<html lang="${input.locale}">
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #111;">
  <div style="max-width: 560px; margin: 0 auto; padding: 24px;">
    <h1 style="font-size: 20px; margin: 0 0 16px;">${safeTitle}</h1>
    <p style="margin: 0 0 16px; white-space: pre-wrap;">${safeBody}</p>
    <h2 style="font-size: 16px; margin: 24px 0 8px;">${safeCtaTitle}</h2>
    <p style="margin: 0 0 24px; white-space: pre-wrap;">${safeCtaBody}</p>
    <p style="margin: 0 0 12px;">
      <a href="${safeClaimUrl}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 6px;">${safeClaimLabel}</a>
    </p>
    <p style="margin: 0 0 24px;">
      <a href="${safePreviewUrl}" style="display: inline-block; background: #f4f4f5; color: #111; text-decoration: none; padding: 10px 16px; border-radius: 6px; border: 1px solid #e4e4e7;">${safePreviewLabel}</a>
    </p>
    <p style="font-size: 12px; color: #666; margin-top: 32px;">${safeFooter}</p>
  </div>
</body>
</html>`;

  const text = `${title}\n\n${body}\n\n${ctaTitle}\n${ctaBody}\n\n${outreach.claimButton}: ${input.claimUrl}\n${outreach.previewButton}: ${previewUrl}`;

  return {
    subject: `${input.copy.subjectPrefix} ${replaceTokens(outreach.subject, tokens)}`,
    html,
    text,
  };
}
