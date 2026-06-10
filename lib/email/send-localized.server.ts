import type { SendEmailInput } from "@/lib/email/send.server";
import { sendEmail } from "@/lib/email/send.server";
import type { Locale } from "@/lib/i18n/config";
import type { ResolvedAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";

export type NotificationRecipient = {
  email: string;
  locale: Locale;
};

export async function sendLocalizedToRecipients(
  recipients: NotificationRecipient[],
  build: (
    dict: ResolvedAppDictionary,
  ) =>
    | Pick<SendEmailInput, "subject" | "html" | "text">
    | Promise<Pick<SendEmailInput, "subject" | "html" | "text">>,
): Promise<void> {
  if (recipients.length === 0) {
    return;
  }

  const byLocale = new Map<Locale, string[]>();

  for (const recipient of recipients) {
    const emails = byLocale.get(recipient.locale) ?? [];
    emails.push(recipient.email);
    byLocale.set(recipient.locale, emails);
  }

  for (const [locale, emails] of byLocale) {
    const dict = await getAppDictionary(locale);
    const content = await build(dict);
    const result = await sendEmail({ to: emails, ...content });

    if (!result.sent) {
      console.warn("[email] not sent to studio recipients", {
        locale,
        to: emails,
        subject: content.subject,
        reason: result.reason,
      });
    }
  }
}

export async function sendLocalizedToRecipient(
  recipient: NotificationRecipient,
  build: (
    dict: ResolvedAppDictionary,
  ) =>
    | Pick<SendEmailInput, "subject" | "html" | "text">
    | Promise<Pick<SendEmailInput, "subject" | "html" | "text">>,
): Promise<void> {
  const dict = await getAppDictionary(recipient.locale);
  const content = await build(dict);
  const result = await sendEmail({ to: recipient.email, ...content });

  if (!result.sent) {
    console.warn("[email] not sent to client recipient", {
      to: recipient.email,
      subject: content.subject,
      reason: result.reason,
    });
  }
}
