import type { Locale } from "@/lib/i18n/config";
import { defaultLocale } from "@/lib/i18n/config";
import type { User } from "@/types/user";

export function resolveRecipientLocale(
  user: Pick<User, "preferredLocale"> | null | undefined,
): Locale {
  return user?.preferredLocale ?? defaultLocale;
}
