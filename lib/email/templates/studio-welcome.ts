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

function replaceStudioName(value: string, studioName: string): string {
  return value.replaceAll("{studioName}", studioName);
}

export function buildStudioWelcomeEmail(input: {
  locale: Locale;
  copy: EmailDictionary;
  studioName: string;
  studioSlug: string;
}) {
  const welcome = input.copy.studioWelcome;
  const baseUrl = getAppBaseUrl();
  const dashboardUrl = `${baseUrl}/dashboard`;
  const bookingPageUrl = `${baseUrl}/${input.studioSlug}`;

  const title = welcome.title;
  const body = replaceStudioName(welcome.body, input.studioName);
  const nextStepsTitle = welcome.nextStepsTitle;
  const nextSteps = welcome.nextSteps;

  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(body);
  const safeNextStepsTitle = escapeHtml(nextStepsTitle);
  const safeNextSteps = escapeHtml(nextSteps);
  const safeDashboardLabel = escapeHtml(welcome.dashboardButton);
  const safeBookingLabel = escapeHtml(welcome.bookingPageButton);
  const safeDashboardUrl = escapeHtml(dashboardUrl);
  const safeBookingUrl = escapeHtml(bookingPageUrl);
  const safeFooter = escapeHtml(input.copy.footerNotice);

  const html = `<!DOCTYPE html>
<html lang="${input.locale}">
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #111;">
  <div style="max-width: 560px; margin: 0 auto; padding: 24px;">
    <h1 style="font-size: 20px; margin: 0 0 16px;">${safeTitle}</h1>
    <p style="margin: 0 0 16px; white-space: pre-wrap;">${safeBody}</p>
    <h2 style="font-size: 16px; margin: 24px 0 8px;">${safeNextStepsTitle}</h2>
    <p style="margin: 0 0 24px; white-space: pre-wrap;">${safeNextSteps}</p>
    <p style="margin: 0 0 12px;">
      <a href="${safeDashboardUrl}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 6px;">${safeDashboardLabel}</a>
    </p>
    <p style="margin: 0 0 24px;">
      <a href="${safeBookingUrl}" style="display: inline-block; background: #f4f4f5; color: #111; text-decoration: none; padding: 10px 16px; border-radius: 6px; border: 1px solid #e4e4e7;">${safeBookingLabel}</a>
    </p>
    <p style="font-size: 12px; color: #666; margin-top: 32px;">${safeFooter}</p>
  </div>
</body>
</html>`;

  const text = `${title}\n\n${body}\n\n${nextStepsTitle}\n${nextSteps}\n\n${welcome.dashboardButton}: ${dashboardUrl}\n${welcome.bookingPageButton}: ${bookingPageUrl}`;

  return {
    subject: `${input.copy.subjectPrefix} ${title}`,
    html,
    text,
  };
}
