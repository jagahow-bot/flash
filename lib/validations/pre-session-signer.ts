import { z } from "zod";
import type { AppDictionary } from "@/lib/i18n/app-types";
import type { PreSessionSignerInfo } from "@/types/pre-session-document";

export type PreSessionSignerInfoMessages = {
  nameRequired: string;
  birthdayRequired: string;
  phoneRequired: string;
  emailRequired: string;
  emailInvalid: string;
};

export function createPreSessionSignerInfoSchema(
  messages: PreSessionSignerInfoMessages
) {
  return z.object({
    name: z.string().trim().min(1, messages.nameRequired),
    birthday: z.string().trim().min(1, messages.birthdayRequired),
    phone: z.string().trim().min(1, messages.phoneRequired),
    email: z
      .string()
      .trim()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
  });
}

export function createPreSessionSignerInfoSchemaFromDict(dict: AppDictionary) {
  const v = dict.preSession.signerValidation;
  return createPreSessionSignerInfoSchema(v);
}

export const serverPreSessionSignerInfoSchema = createPreSessionSignerInfoSchema(
  {
    nameRequired: "請填寫姓名",
    birthdayRequired: "請填寫生日",
    phoneRequired: "請填寫電話",
    emailRequired: "請填寫 Email",
    emailInvalid: "Email 格式不正確",
  }
);

export type PreSessionSignerInfoValues = z.infer<
  ReturnType<typeof createPreSessionSignerInfoSchema>
>;

export function parsePreSessionSignerInfo(
  value: unknown
): PreSessionSignerInfo | null {
  const parsed = serverPreSessionSignerInfoSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
