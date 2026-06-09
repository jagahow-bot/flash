import type { LandingDictionary } from "@/lib/i18n/types";

const dictionary: LandingDictionary = {
  locale: "en",
  meta: {
    title: "FLASH — Tattoo Studio Booking & Project Management",
    description:
      "Tattoo studio booking system: fewer missed bookings, fewer repeat messages. Manage requests, quotes, scheduling, deposits, and multi-session bookings in one place.",
    keywords: [
      "tattoo booking",
      "tattoo studio management",
      "tattoo shop software",
      "FLASH",
      "tattoo deposit",
      "multi-session tattoo",
      "tattoo project management",
      "tattoo client management",
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
    heading: "Tattoo studio booking & project management",
    subtitle:
      "Fewer missed bookings, fewer repeat messages,\nso you can focus on tattooing.",
    description:
      "No more starting from scratch in DMs —\nyou and your clients always know what's next.",
    ctaLogin: "Log in",
    ctaRegisterStudio: "Register studio",
  },
  about: {
    title: "What is FLASH?",
    paragraphs: [
      "A tattoo studio booking system for managing projects end to end.\nShop owners and artists run the back office; clients fill out requests and check progress on their own — separate flows, synced data.",
      "Sound familiar? Clients explain half the idea, deposits don't match the books, multi-session pieces get mixed up, and the DMs keep asking \"any update?\"\nFLASH puts it all in one place: from intake and quoting to deposits and multi-session scheduling — clear steps, clear records.",
      "Clients open your link to start a project; you open the back office when you're ready to work on it.",
    ],
  },
  features: {
    title: "What saves studios time",
    subtitle:
      "The steps where bookings slip through —\nwithout relying on memory alone",
    items: [
      {
        title: "Understand what clients mean",
        schemaName: "AI client intake summary",
        description:
          "Vague requests, clear highlights when you open them —\nknow what you're quoting before you quote.",
      },
      {
        title: "Quotes without endless back-and-forth",
        schemaName: "Quote and scheduling",
        description:
          "New projects in one place, send times when you're ready —\nclients pick; you focus on the art.",
      },
      {
        title: "Deposits that add up",
        schemaName: "Deposit tracking",
        description:
          "Who paid, how much — all recorded.\nNo scrolling chat history to reconcile.",
      },
      {
        title: "Multi-session pieces, still clear",
        schemaName: "Multi-session booking",
        description:
          "Which visit, when's next —\nyou and your client both see it.",
      },
    ],
  },
  howItWorks: {
    title: "How it works",
    subtitle: "Clients and studios each have their own flow —\nprogress stays in sync",
    clientTitle: "For clients",
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
    studioTitle: "For studios",
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
  faq: {
    title: "FAQ",
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
    tagline: "Tattoo studio booking & project management",
    product: "Product",
    account: "Account",
    login: "Log in",
    myProjects: "My bookings",
    studioRegister: "Register studio",
    rights: "All rights reserved.",
  },
};

export default dictionary;
