import type { Locale } from "@/lib/i18n/config";
import { defaultLocale } from "@/lib/i18n/config";
import type { EmailDictionary } from "@/lib/i18n/email-types";

const emailDictionaries: Record<
  Locale,
  () => Promise<{ default: EmailDictionary }>
> = {
  "zh-Hant": () => import("@/lib/i18n/dictionaries/email/zh-Hant"),
  en: () => import("@/lib/i18n/dictionaries/email/en"),
  ja: () => import("@/lib/i18n/dictionaries/email/ja"),
  ko: () => import("@/lib/i18n/dictionaries/email/ko"),
  es: () => import("@/lib/i18n/dictionaries/email/es"),
  "pt-BR": () => import("@/lib/i18n/dictionaries/email/pt-BR"),
  de: () => import("@/lib/i18n/dictionaries/email/de"),
  fr: () => import("@/lib/i18n/dictionaries/email/fr"),
  th: () => import("@/lib/i18n/dictionaries/email/th"),
};

function mergeEmailDictionary(
  base: EmailDictionary,
  override: Partial<EmailDictionary>,
): EmailDictionary {
  return {
    ...base,
    ...override,
    verification: { ...base.verification, ...override.verification },
    newIntake: { ...base.newIntake, ...override.newIntake },
    discussionClientMessage: {
      ...base.discussionClientMessage,
      ...override.discussionClientMessage,
    },
    discussionStudioReply: {
      ...base.discussionStudioReply,
      ...override.discussionStudioReply,
    },
    quoteFirstSend: { ...base.quoteFirstSend, ...override.quoteFirstSend },
    quoteUpdatedBoth: {
      ...base.quoteUpdatedBoth,
      ...override.quoteUpdatedBoth,
    },
    quoteSlotsUpdated: {
      ...base.quoteSlotsUpdated,
      ...override.quoteSlotsUpdated,
    },
    quotePriceUpdated: {
      ...base.quotePriceUpdated,
      ...override.quotePriceUpdated,
    },
    slotReservedClient: {
      ...base.slotReservedClient,
      ...override.slotReservedClient,
    },
    slotReservedStudio: {
      ...base.slotReservedStudio,
      ...override.slotReservedStudio,
    },
    depositExpiredClient: {
      ...base.depositExpiredClient,
      ...override.depositExpiredClient,
    },
    depositExpiredStudio: {
      ...base.depositExpiredStudio,
      ...override.depositExpiredStudio,
    },
    depositSubmitted: {
      ...base.depositSubmitted,
      ...override.depositSubmitted,
    },
    sketchesUploaded: {
      ...base.sketchesUploaded,
      ...override.sketchesUploaded,
    },
    finalPhotosUploaded: {
      ...base.finalPhotosUploaded,
      ...override.finalPhotosUploaded,
    },
    projectCompleted: {
      ...base.projectCompleted,
      ...override.projectCompleted,
    },
    depositConfirmedSingle: {
      ...base.depositConfirmedSingle,
      ...override.depositConfirmedSingle,
    },
    depositConfirmedMulti: {
      ...base.depositConfirmedMulti,
      ...override.depositConfirmedMulti,
    },
    nextSessionReadyMulti: {
      ...base.nextSessionReadyMulti,
      ...override.nextSessionReadyMulti,
    },
    nextSessionReadySingle: {
      ...base.nextSessionReadySingle,
      ...override.nextSessionReadySingle,
    },
    preSessionSignedStudio: {
      ...base.preSessionSignedStudio,
      ...override.preSessionSignedStudio,
    },
    preSessionArchivedClient: {
      ...base.preSessionArchivedClient,
      ...override.preSessionArchivedClient,
    },
  };
}

export async function getEmailDictionary(locale: Locale): Promise<EmailDictionary> {
  const baseModule = await emailDictionaries[defaultLocale]();
  const base = baseModule.default;

  if (locale === defaultLocale) {
    return base;
  }

  const localeModule = await emailDictionaries[locale]();
  return mergeEmailDictionary(base, localeModule.default);
}
