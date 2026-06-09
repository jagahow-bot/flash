function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildVerificationEmail(input: {
  verificationLink: string;
  audience: "client" | "studio";
}) {
  const title =
    input.audience === "client" ? "請驗證您的客戶帳號" : "請驗證您的工作室帳號";
  const body =
    input.audience === "client"
      ? "點擊下方按鈕完成 Email 驗證後，即可送出預約需求並接收通知。"
      : "點擊下方按鈕完成 Email 驗證後，即可接收預約相關通知。";

  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(body);
  const safeLink = escapeHtml(input.verificationLink);

  const html = `<!DOCTYPE html>
<html lang="zh-Hant">
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #111;">
  <div style="max-width: 560px; margin: 0 auto; padding: 24px;">
    <h1 style="font-size: 20px; margin: 0 0 16px;">${safeTitle}</h1>
    <p style="margin: 0 0 16px;">${safeBody}</p>
    <p style="margin: 24px 0;">
      <a href="${safeLink}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 6px;">驗證 Email</a>
    </p>
    <p style="font-size: 12px; color: #666;">若按鈕無法點擊，請複製以下連結到瀏覽器：<br>${safeLink}</p>
    <p style="font-size: 12px; color: #666; margin-top: 32px;">FLASH 預約系統 · 請勿直接回覆此信</p>
  </div>
</body>
</html>`;

  const text = `${title}\n\n${body}\n\n驗證連結：${input.verificationLink}`;

  return {
    subject: `[FLASH] ${title}`,
    html,
    text,
  };
}
