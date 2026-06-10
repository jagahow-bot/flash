export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  sent: boolean;
  skipped?: boolean;
  reason?: string;
}

function normalizeRecipients(to: string | string[]): string[] {
  const list = Array.isArray(to) ? to : [to];
  return [...new Set(list.map((email) => email.trim().toLowerCase()).filter(Boolean))];
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const recipients = normalizeRecipients(input.to);

  if (recipients.length === 0) {
    return { sent: false, skipped: true, reason: "no_recipients" };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    console.warn("[email] skipped (missing RESEND_API_KEY or EMAIL_FROM)", {
      to: recipients,
      subject: input.subject,
      hasApiKey: Boolean(apiKey),
      hasFrom: Boolean(from),
    });
    return { sent: false, skipped: true, reason: "missing_config" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API error (${response.status}): ${body}`);
  }

  return { sent: true };
}
