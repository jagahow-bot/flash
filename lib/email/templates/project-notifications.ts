import { getAppBaseUrl } from "@/lib/email/app-url";
import type { Locale } from "@/lib/i18n/config";
import type { ResolvedAppDictionary } from "@/lib/i18n/get-app-dictionary";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function layout(
  locale: Locale,
  title: string,
  body: string,
  actionLabel: string,
  actionUrl: string,
  footerNotice: string,
) {
  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(body);
  const safeLabel = escapeHtml(actionLabel);
  const safeUrl = escapeHtml(actionUrl);
  const safeFooter = escapeHtml(footerNotice);

  return `<!DOCTYPE html>
<html lang="${locale}">
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #111;">
  <div style="max-width: 560px; margin: 0 auto; padding: 24px;">
    <h1 style="font-size: 20px; margin: 0 0 16px;">${safeTitle}</h1>
    <p style="margin: 0 0 16px; white-space: pre-wrap;">${safeBody}</p>
    <p style="margin: 24px 0;">
      <a href="${safeUrl}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 6px;">${safeLabel}</a>
    </p>
    <p style="font-size: 12px; color: #666; margin-top: 32px;">${safeFooter}</p>
  </div>
</body>
</html>`;
}

export function buildProjectEmail(input: {
  dict: ResolvedAppDictionary;
  locale: Locale;
  studioName: string;
  projectId: string;
  studioSlug: string;
  title: string;
  body: string;
  audience: "client" | "studio";
}) {
  const { email: copy } = input.dict;
  const baseUrl = getAppBaseUrl();
  const actionUrl =
    input.audience === "client"
      ? `${baseUrl}/${input.studioSlug}/p/${input.projectId}`
      : `${baseUrl}/dashboard/projects/${input.projectId}`;
  const actionLabel =
    input.audience === "client" ? copy.actionClient : copy.actionStudio;

  const subject = `${copy.subjectPrefix} ${input.title} · ${input.projectId}`;
  const html = layout(
    input.locale,
    input.title,
    input.body,
    actionLabel,
    actionUrl,
    copy.footerNotice,
  );
  const text = `${input.title}\n\n${input.body}\n\n${actionLabel}: ${actionUrl}`;

  return { subject, html, text };
}
