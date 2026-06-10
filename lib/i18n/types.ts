export interface LandingFeature {
  title: string;
  /** Functional label for JSON-LD featureList (SEO). */
  schemaName: string;
  description: string;
}

export interface LandingStep {
  title: string;
  description: string;
}

export interface LandingFaq {
  question: string;
  answer: string;
}

export type LandingLocale =
  | "zh-Hant"
  | "en"
  | "ja"
  | "ko"
  | "es"
  | "pt-BR"
  | "de"
  | "fr"
  | "th";

export interface LandingDictionary {
  locale: LandingLocale;
  meta: {
    title: string;
    description: string;
    keywords: string[];
  };
  header: {
    home: string;
    login: string;
    myProjects: string;
    studioRegister: string;
    studioDashboard: string;
    language: string;
    switchToEn: string;
    switchToZh: string;
  };
  hero: {
    eyebrow: string;
    brand: string;
    heading: string;
    subtitle: string;
    description: string;
    ctaLogin: string;
    ctaRegisterStudio: string;
  };
  about: {
    title: string;
    paragraphs: string[];
  };
  features: {
    title: string;
    subtitle: string;
    items: LandingFeature[];
  };
  howItWorks: {
    title: string;
    subtitle: string;
    clientTitle: string;
    clientSteps: LandingStep[];
    studioTitle: string;
    studioSteps: LandingStep[];
  };
  pricing: {
    title: string;
    subtitle: string;
    pricePerBooking: string;
    noMonthlyFee: string;
    freeTier: string;
    footnote: string;
  };
  faq: {
    title: string;
    subtitle: string;
    items: LandingFaq[];
  };
  cta: {
    title: string;
    description: string;
    loginButton: string;
    studioButton: string;
  };
  footer: {
    tagline: string;
    product: string;
    account: string;
    legal: string;
    login: string;
    myProjects: string;
    studioRegister: string;
    privacyPolicy: string;
    termsOfService: string;
    rights: string;
    contactSupportPrefix: string;
    contactSupportSuffix?: string;
  };
  legal: {
    privacy: {
      metaTitle: string;
      metaDescription: string;
    };
    terms: {
      metaTitle: string;
      metaDescription: string;
    };
  };
}
