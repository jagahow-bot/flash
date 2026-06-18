import type { LandingDictionary } from "@/lib/i18n/types";

const dictionary: LandingDictionary = {
  locale: "en",
  meta: {
    title:
      "FLASH — Intelligent Booking & Case Management System for Tattoo Studios",
    description:
      "Say goodbye to messy DMs! FLASH offers personalized booking links, AI-powered requirement summaries, automatic watermarking, and dedicated two-way boards. No fixed monthly fees—focus on your art and effortlessly manage custom work and flash designs.",
    ogDescription:
      "Say goodbye to messy DMs! FLASH offers personalized booking links, AI summaries, automatic watermarking, and dedicated two-way collaboration boards.",
    keywords: [
      "tattoo booking",
      "tattoo studio management",
      "tattoo shop software",
      "FLASH",
      "tattoo case management",
      "AI smart summary",
      "tattoo booking management system",
      "multi-language booking",
    ],
  },
  header: {
    home: "Home",
    login: "Log in",
    myProjects: "My bookings",
    studioRegister: "Register studio",
    studioDashboard: "Studio dashboard",
    language: "Language",
    switchToEn: "English",
    switchToZh: "繁體中文",
  },
  hero: {
    eyebrow: "Built for tattoo studios",
    brand: "FLASH",
    heading: "Tattoo Studio Booking & Case Management",
    subtitle:
      "Every line, dot, and shade deserves 100% of your focus.",
    description: "",
    ctaLogin: "Log in",
    ctaRegisterStudio: "Register studio",
  },
  about: {
    title:
      "Why Tattoo Artists Everywhere Are Using FLASH Booking Management System?",
    paragraphs: [
      "Every line, dot, and shade deserves 100% of your focus. But the reality is, replying to DMs and managing bookings takes up most of your energy.",
      "FLASH was born to free your hands. We automate tedious tasks like gathering requirements, scheduling, and protecting sketches.",
      "No more getting stuck waiting for client sizes, and no more juggling records across multiple social apps. Reduce unnecessary communication to zero, and save your most valuable time for the next masterpiece.",
    ],
  },
  productShowcase: {
    title: "See FLASH in action",
    subtitle:
      "Studio dashboard and client project views — twin perspectives, always in sync",
    studioTitle: "Studio dashboard",
    studioDescription:
      "Action inbox, calendar, and project status — run your shop from one screen",
    studioAlt:
      "FLASH studio dashboard showing pending tasks and upcoming appointments",
    clientTitle: "Client project view",
    clientDescription:
      "Quote review, time slot selection, and artwork progress — clients always know what's next",
    clientProgressAlt: "FLASH client project page at the quote stage",
    clientArtworkAlt:
      "FLASH client project page showing artwork and progress timeline",
  },
  features: {
    title: "Automated Studio Management, Saving 80% of Communication Time",
    subtitle: "",
    items: [
      {
        title: "AI Smart Summary: Accurately capture client tattoo needs",
        schemaName: "AI Smart Summary",
        description:
          "Once clients submit their request, AI summarizes key points — complexity and risks at a glance before you quote.",
      },
      {
        title: "Multi-language Support: Seamlessly accept international traveler bookings",
        schemaName: "Multi-language Support",
        description:
          "Ten-language interface lets international travelers book with ease — zero communication barriers.",
      },
      {
        title: "Independent Two-Way Board: Sketch revision history never lost",
        schemaName: "Independent Two-Way Board",
        description:
          "Separate views for clients and studios keep every sketch revision on record — no more buried DMs.",
      },
      {
        title: "Automatic Smart Watermark: All-round protection for original sketches",
        schemaName: "Automatic Smart Watermark",
        description:
          "Uploads are watermarked automatically to protect original sketches from screenshots and leaks.",
      },
    ],
  },
  howItWorks: {
    title: "From First Consultation to Consent: The Smoothest Tattoo Booking Flow",
    subtitle: "Clients and studios each have their own flow —\nprogress stays in sync",
    clientTitle: "Client side: clear guidance, easy intake",
    clientSteps: [
      {
        title: "Open your booking link",
        description: "Got an idea for the tattoo you want?",
      },
      {
        title: "Share your idea",
        description:
          "Design, placement, budget — say it in your words, photos welcome",
      },
      {
        title: "Wait for a quote, pick a time",
        description:
          "When the price comes through, choose a slot and pay the deposit as directed",
      },
      {
        title: "Always know where things stand",
        description:
          "No more \"any update?\" — just open and see",
      },
    ],
    studioTitle: "Studio side: at a glance, digital records",
    studioSteps: [
      {
        title: "Get your shop set up",
        description:
          "Register, fill in the basics, then share your booking link",
      },
      {
        title: "Review new projects, decide if it's a fit",
        description:
          "Client requests at a glance — confirm, then quote",
      },
      {
        title: "Set times, collect deposit",
        description:
          "You offer open days; they pick, pay, and the booking is set",
      },
      {
        title: "Big pieces across multiple visits",
        description:
          "Every session, when it's happening — crystal clear",
      },
    ],
  },
  pricing: {
    title: "Artist-friendly flexible pricing: no monthly fee, pay per booking",
    subtitle:
      "No monthly subscription — you only pay when bookings succeed through FLASH.",
    pricePerBooking: "USD $3 per successful booking each month",
    noMonthlyFee: "No fixed monthly fee",
    freeTier: "First 30 bookings per studio are FREE",
    footnote:
      "Billing is based on your studio's successful bookings count each calendar month. Multi-session projects count as one booking when confirmed.",
  },
  faq: {
    title: "Frequently asked questions about FLASH tattoo management software",
    subtitle: "Common tattoo shop questions, plain answers",
    items: [
      {
        question: "Who is FLASH for?",
        answer:
          "If you're an artist or shop owner — fewer missed steps, clearer flow.\nIf you're a client — book and check your own progress.",
      },
      {
        question: "How do you manage large pieces across multiple sessions?",
        answer:
          "One project can hold multiple sessions, each one tracked.\nYou and your client always know which visit is next and when.",
      },
      {
        question: "How does the system organize client requests?",
        answer:
          "Once a client submits, it's summarized into key points.\nComplexity, cover-up risks — enough to decide if you want the job.",
      },
      {
        question: "How do clients book and pay a deposit?",
        answer:
          "Clients start from your booking link; after the quote they pick a time and pay the deposit.\nYou confirm receipt and the booking is set.",
      },
      {
        question: "What can the back office do?",
        answer:
          "Start with projects still pending and deposits not yet matched, then check upcoming sessions.\nOpen it and you know what today needs.",
      },
      {
        question: "How is this different from generic booking software?",
        answer:
          "Most booking tools only handle one time slot.\nTattoo shops also juggle requests, deposits, and multiple visits — FLASH is built for that.",
      },
      {
        question: "Can you take cover-up projects?",
        answer:
          "Yes. Clients can flag cover-ups and risky ones get highlighted.\nYou can also say upfront whether you take them — saves wasted chats.",
      },
      {
        question: "Can studios offer flash designs?",
        answer:
          "Yes. Upload flash designs in your dashboard settings — set a uniform price or price each design separately, and define the sizes clients can choose.\nOn your booking page, clients can browse your flash catalog or start a custom tattoo request instead.",
      },
      {
        question: "Do clients need to download an app?",
        answer:
          "No. Clients and studios both use a browser link — phone or desktop, either works.",
      },
      {
        question: "What if a deposit doesn't match your records?",
        answer:
          "Who paid and how much is logged. The back office flags deposits that still need matching — no scrolling DMs to reconcile.",
      },
      {
        question: "Can clients keep track of multi-session pieces?",
        answer:
          "Each visit is labeled in one project. Clients open your link and see which session they're on and when the next one is.",
      },
    ],
  },
  cta: {
    title: "Want fewer missed bookings and repeat messages?",
    description:
      "Ready to book? Open the link.\nReady to run your projects better? Register now.",
    loginButton: "Log in",
    studioButton: "Register studio",
  },
  footer: {
    tagline: "Tattoo studio booking & case management",
    product: "Product",
    account: "Account",
    legal: "Legal",
    login: "Log in",
    myProjects: "My bookings",
    studioRegister: "Register studio",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    blog: "Studio guides",
    rights: "All rights reserved.",
    contactSupportPrefix: "Questions? Email us at ",
  },
  legal: {
    privacy: {
      metaTitle: "Privacy Policy",
      metaDescription:
        "How FLASH collects, uses, and protects your personal information on ink-flash.com.",
    },
    terms: {
      metaTitle: "Terms of Service",
      metaDescription:
        "Terms and conditions for using the FLASH tattoo studio management platform.",
    },
  },
  blog: {
    metaTitle: "Tattoo Studio Guides | FLASH",
    metaDescription:
      "Copyright protection, legal safeguards, and studio operations advice for tattoo artists.",
    title: "Tattoo Studio Guides",
    description:
      "Practical articles on copyright protection, legal safeguards, and running a safer tattoo studio.",
    backToBlog: "Back to articles",
    readMore: "Read article",
    categories: {
      ipProtection: "IP Protection",
      legalSafeguards: "Legal Safeguards",
      globalMarketing: "Global Marketing",
    },
  },
};

export default dictionary;
