import type { LandingDictionary } from "@/lib/i18n/types";
import { localePath } from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/i18n/site-url";

const LOCALE_CURRENCY: Partial<Record<LandingDictionary["locale"], string>> = {
  "zh-Hant": "TWD",
  en: "USD",
  ja: "JPY",
  ko: "KRW",
  es: "EUR",
  "pt-BR": "BRL",
  de: "EUR",
  fr: "EUR",
  th: "THB",
};

const LOCALE_AUDIENCE: Partial<Record<LandingDictionary["locale"], string>> = {
  en: "Tattoo studios and clients",
  ja: "タトゥースタジオとお客様",
  ko: "타투 스튜디오와 고객",
  es: "Estudios de tatuaje y clientes",
  "pt-BR": "Estúdios de tatuagem e clientes",
  de: "Tattoo-Studios und Kunden",
  fr: "Studios de tatouage et clients",
  th: "สตูดิโอสักและลูกค้า",
};

export function LandingStructuredData({
  dict,
  audienceType,
}: {
  dict: LandingDictionary;
  audienceType?: string;
}) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${localePath(dict.locale)}`;
  const currency = LOCALE_CURRENCY[dict.locale] ?? "USD";

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FLASH",
    url: siteUrl,
    description: dict.meta.description,
    logo: `${siteUrl}/favicon.ico`,
  };

  const webApplication = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FLASH",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: pageUrl,
    description: dict.meta.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: currency,
      description: dict.footer.tagline,
    },
    featureList: dict.features.items.map(
      (item) => item.schemaName ?? item.title,
    ),
    audience: {
      "@type": "Audience",
      audienceType:
        audienceType ??
        LOCALE_AUDIENCE[dict.locale] ??
        "Tattoo studios and clients",
    },
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const schemas = [organization, webApplication, faqPage];

  return (
    <>
      {schemas.map((schema) => (
        <script
          key={schema["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
