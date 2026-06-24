import type { Locale } from "@/lib/i18n/config";
import type { Studio, StudioSocialLinks } from "@/types/studio";

export function getProspectPaymentInfo(locale: Locale): string {
  if (locale === "en") {
    return "(Demo) Update your payment instructions after activating your account — e.g. bank transfer, PayPal, or Venmo.";
  }

  return "（示範）啟用帳號後請更新收款資訊，例如：銀行轉帳、LINE Pay 或街口支付。";
}

export function getProspectDefaultBio(locale: Locale, studioName: string): string {
  if (locale === "en") {
    return `${studioName} specializes in custom tattoos and flash designs. Book a consultation to share your idea — our team will review placement, style, and scheduling with you.`;
  }

  return `${studioName} 專注客製化刺青與認領圖預約。提交需求後，我們會協助確認部位、風格與可施作時段，讓溝通更順暢。`;
}

export function getProspectDefaultCareGuide(_locale: Locale): string {
  return "";
}

export function getProspectDefaultSocialLinks(): StudioSocialLinks {
  return {
    instagram: "flash.demo.studio",
    line: "@flash-demo",
  };
}

export function getProspectLogoUrl(): string {
  return "https://placehold.co/160x160/png?text=LOGO";
}

export interface ProspectStudioDefaults {
  bio: string;
  careGuide: string;
  paymentInfo: string;
  logoUrl: string;
  socialLinks: StudioSocialLinks;
  flashBookingEnabled: boolean;
  flashUniformPrice: number;
}

export function getProspectStudioDefaults(
  locale: Locale,
  studioName: string,
): ProspectStudioDefaults {
  return {
    bio: getProspectDefaultBio(locale, studioName),
    careGuide: getProspectDefaultCareGuide(locale),
    paymentInfo: getProspectPaymentInfo(locale),
    logoUrl: getProspectLogoUrl(),
    socialLinks: getProspectDefaultSocialLinks(),
    flashBookingEnabled: true,
    flashUniformPrice: locale === "en" ? 180 : 4500,
  };
}

export function applyProspectDefaultsToStudio(
  studio: Studio,
  locale: Locale,
): Studio {
  const defaults = getProspectStudioDefaults(locale, studio.name);
  return {
    ...studio,
    bio: studio.bio.trim() || defaults.bio,
    careGuide: studio.careGuide.trim(),
    paymentInfo: studio.paymentInfo.trim() || defaults.paymentInfo,
    logoUrl: studio.logoUrl ?? defaults.logoUrl,
    socialLinks: studio.socialLinks ?? defaults.socialLinks,
    flashBookingEnabled: studio.flashBookingEnabled ?? defaults.flashBookingEnabled,
    flashUniformPrice:
      studio.flashUniformPrice ?? defaults.flashUniformPrice,
  };
}
