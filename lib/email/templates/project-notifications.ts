import { getAppBaseUrl } from "@/lib/email/app-url";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function layout(title: string, body: string, actionLabel: string, actionUrl: string) {
  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(body);
  const safeLabel = escapeHtml(actionLabel);
  const safeUrl = escapeHtml(actionUrl);

  return `<!DOCTYPE html>
<html lang="zh-Hant">
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #111;">
  <div style="max-width: 560px; margin: 0 auto; padding: 24px;">
    <h1 style="font-size: 20px; margin: 0 0 16px;">${safeTitle}</h1>
    <p style="margin: 0 0 16px; white-space: pre-wrap;">${safeBody}</p>
    <p style="margin: 24px 0;">
      <a href="${safeUrl}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 6px;">${safeLabel}</a>
    </p>
    <p style="font-size: 12px; color: #666; margin-top: 32px;">FLASH 預約系統通知 · 請勿直接回覆此信</p>
  </div>
</body>
</html>`;
}

export function buildProjectEmail(input: {
  studioName: string;
  projectId: string;
  studioSlug: string;
  title: string;
  body: string;
  audience: "client" | "studio";
}) {
  const baseUrl = getAppBaseUrl();
  const actionUrl =
    input.audience === "client"
      ? `${baseUrl}/${input.studioSlug}/p/${input.projectId}`
      : `${baseUrl}/dashboard/projects/${input.projectId}`;
  const actionLabel =
    input.audience === "client" ? "查看預約進度" : "前往後台處理";

  const subject = `[FLASH] ${input.title} · ${input.projectId}`;
  const html = layout(input.title, input.body, actionLabel, actionUrl);
  const text = `${input.title}\n\n${input.body}\n\n${actionLabel}: ${actionUrl}`;

  return { subject, html, text };
}
