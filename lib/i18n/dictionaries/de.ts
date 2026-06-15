import type { LandingDictionary } from "@/lib/i18n/types";

const dictionary: LandingDictionary = {
  locale: "de",
  meta: {
    title:
      "FLASH — Intelligentes Terminbuchungs- & Fallmanagementsystem für Tattoo-Studios",
    description:
      "Schluss mit dem Chaos in den DMs! FLASH bietet personalisierte Buchungslinks, KI-basierte Kundenwunsch-Zusammenfassungen, automatische Wasserzeichen und separate Dashboards. Keine festen Monatsgebühren – konzentriere dich auf deine Kunst und verwalte Custom- und Flash-Aufträge mühelos.",
    ogDescription:
      "Schluss mit dem Chaos in den DMs! FLASH bietet personalisierte Buchungslinks, KI-Zusammenfassungen, automatische Wasserzeichen und separate Dashboards.",
    keywords: [
      "Tattoo Buchung",
      "Tattoo Studio Verwaltung",
      "Tattoo Shop Software",
      "FLASH",
      "Tattoo Fallmanagement",
      "Intelligente KI-Zusammenfassung",
      "Tattoo Buchungsmanagementsystem",
      "Mehrsprachige Buchung",
    ],
  },
  header: {
    home: "Start",
    login: "Anmelden",
    myProjects: "Meine Buchungen",
    studioRegister: "Studio registrieren",
    studioDashboard: "Studio-Dashboard",
    language: "Sprache",
    switchToEn: "English",
    switchToZh: "繁體中文",
  },
  hero: {
    eyebrow: "Für Tattoo-Studios",
    brand: "FLASH",
    heading: "Terminbuchung & Fallmanagement für Tattoo-Studios",
    subtitle: "Jede Linie, jeder Punkt und jede Schattierung verdient 100 % deines Fokus.",
    description: "",
    ctaLogin: "Anmelden",
    ctaRegisterStudio: "Studio registrieren",
  },
  about: {
    title: "Warum Tätowierer überall auf das FLASH-Buchungsmanagementsystem setzen?",
    paragraphs: [
      "Jede Linie, jeder Punkt und jede Schattierung verdient 100 % deines Fokus. Die Realität ist jedoch, dass das Beantworten von DMs und das Verwalten von Buchungen den Großteil deiner Energie raubt.",
      "FLASH wurde entwickelt, um dir den Rücken freizuhalten. Wir automatisieren lästige Aufgaben wie das Erfassen von Kundenwünschen, die Terminplanung und den Schutz von Skizzen.",
      "Kein Warten mehr auf die Größenangaben des Kunden, kein Suchen mehr nach Nachrichten in verschiedenen Social-Media-Apps. Reduziere unnötige Kommunikation auf Null und spare deine wertvollste Zeit für das nächste Meisterwerk.",
    ],
  },
  features: {
    title: "Automatisierte Studioverwaltung, spart 80 % der Kommunikationszeit",
    subtitle: "",
    items: [
      {
        title: "Intelligente KI-Zusammenfassung: Kundenwünsche präzise erfassen",
        schemaName: "Intelligente KI-Zusammenfassung",
        description:
          "Sobald Kunden ihre Anfrage senden, fasst die KI die Kernpunkte zusammen — Komplexität und Risiken auf einen Blick vor dem Angebot.",
      },
      {
        title: "Multilinguale Unterstützung: Buchungen internationaler Reisender nahtlos annehmen",
        schemaName: "Multilinguale Unterstützung",
        description:
          "Zehnsprachige Oberfläche, damit internationale Reisende mühelos buchen können — null Kommunikationsbarrieren.",
      },
      {
        title: "Unabhängiges Dashboard: Verlauf der Design-Anpassungen geht nie verloren",
        schemaName: "Unabhängiges Dashboard",
        description:
          "Getrennte Ansichten für Kunden und Studio bewahren jede Design-Anpassung — keine verlorenen DMs mehr.",
      },
      {
        title: "Automatisches Wasserzeichen: Umfassender Schutz für Original-Skizzen",
        schemaName: "Automatisches Wasserzeichen",
        description:
          "Uploads werden automatisch mit Wasserzeichen versehen, um Original-Skizzen vor Screenshots und Leaks zu schützen.",
      },
    ],
  },
  howItWorks: {
    title: "Vom ersten Beratungsgespräch bis zur Einwilligung: der reibungsloseste Tattoo-Buchungsablauf",
    subtitle: "Kunden und Studio, jeder mit eigenem Ablauf —\nder Fortschritt bleibt synchron",
    clientTitle: "Kundenseite: klare Führung, einfache Eingabe",
    clientSteps: [
      {
        title: "Buchungslink öffnen",
        description: "Hast du schon eine Idee für dein Tattoo?",
      },
      {
        title: "Deine Idee mitteilen",
        description: "Motiv, Stelle, Budget — in deinen Worten, Fotos gerne dazu",
      },
      {
        title: "Auf Angebot warten, Termin wählen",
        description: "Wenn der Preis da ist, Slot wählen und Anzahlung wie angegeben zahlen",
      },
      {
        title: "Immer wissen, wo es steht",
        description: "Kein «Wie ist der Stand?» mehr — einfach öffnen und sehen",
      },
    ],
    studioTitle: "Studio-Seite: auf einen Blick, digitale Ablage",
    studioSteps: [
      {
        title: "Studio startklar machen",
        description: "Registrieren, Basics eintragen, dann Buchungslink teilen",
      },
      {
        title: "Neue Projekte prüfen, entscheiden ob es passt",
        description: "Kundenanfragen auf einen Blick — klären, dann anbieten",
      },
      {
        title: "Termine setzen, Anzahlung kassieren",
        description: "Du bietest freie Tage an; sie wählen, zahlen, Buchung steht",
      },
      {
        title: "Große Stücke über mehrere Termine",
        description: "Jede Sitzung, wann sie ist — alles klar",
      },
    ],
  },
  pricing: {
    title: "Flexible Preise für Tätowierer: keine Monatsgebühr, zahlen pro Buchung",
    subtitle:
      "Keine feste Monatsgebühr — Sie zahlen nur, wenn Buchungen über FLASH zustande kommen.",
    pricePerBooking: "USD $3 pro erfolgreicher Buchung pro Monat",
    noMonthlyFee: "Keine feste Monatsgebühr",
    freeTier: "Die ersten 30 Buchungen pro Studio sind KOSTENLOS",
    footnote:
      "Die Abrechnung basiert auf der Anzahl erfolgreicher Buchungen Ihres Studios im Kalendermonat. Mehrtermin-Projekte zählen bei Bestätigung als eine Buchung.",
  },
  faq: {
    title: "Häufig gestellte Fragen zur FLASH Tattoo-Management-Software",
    subtitle: "Was Tattoo-Shops oft fragen — klar beantwortet",
    items: [
      {
        question: "Für wen ist FLASH?",
        answer:
          "Als Artist oder Studio-Inhaber — weniger verpasste Schritte, klarerer Ablauf.\nAls Kunde — buchen und eigenen Fortschritt selbst prüfen.",
      },
      {
        question: "Wie verwaltet man große Mehrtermin-Arbeiten?",
        answer:
          "Ein Projekt kann mehrere Sitzungen haben, jede wird erfasst.\nDu und dein Kunde wissen immer, welche Sitzung als Nächstes kommt und wann.",
      },
      {
        question: "Wie organisiert das System Kundenanfragen?",
        answer:
          "Nach der Kundenanfrage entsteht eine Zusammenfassung der Kernpunkte.\nKomplexität, Cover-up-Risiken — genug, um zu entscheiden, ob du annimmst.",
      },
      {
        question: "Wie buchen Kunden und zahlen die Anzahlung?",
        answer:
          "Kunden starten über deinen Link; nach dem Angebot wählen sie einen Termin und zahlen die Anzahlung.\nDu bestätigst den Eingang — Buchung steht.",
      },
      {
        question: "Was kann das Backend?",
        answer:
          "Zuerst offene Projekte und nicht zugeordnete Anzahlungen, dann kommende Termine.\nÖffnen und wissen, was heute ansteht.",
      },
      {
        question: "Worin unterscheidet sich das von normaler Buchungssoftware?",
        answer:
          "Die meisten Tools handeln nur einen Termin.\nTattoo-Shops jonglieren auch mit Anfragen, Anzahlungen und Mehrterminen — FLASH ist dafür gemacht.",
      },
      {
        question: "Sind Cover-up-Projekte möglich?",
        answer:
          "Ja. Kunden können Cover-up markieren, riskante Fälle werden hervorgehoben.\nDu kannst auch vorab sagen, ob du sie annimmst — spart unnötige Gespräche.",
      },
      {
        question: "Können Studios Flash-Designs anbieten?",
        answer:
          "Ja. Lade Flash-Designs in den Dashboard-Einstellungen hoch — einheitlicher Preis oder Preis pro Design, plus die Größen, die Kunden wählen dürfen.\nAuf der Buchungsseite können Kunden deinen Flash-Katalog durchstöbern oder stattdessen ein individuelles Tattoo anfragen.",
      },
      {
        question: "Muss man eine App installieren?",
        answer:
          "Nein. Kunden und Studio nutzen einen Link im Browser — Handy oder PC, egal.",
      },
      {
        question: "Was, wenn eine Anzahlung nicht zu deinen Unterlagen passt?",
        answer:
          "Wer wie viel gezahlt hat, ist dokumentiert. Das Backend markiert offene Anzahlungen — kein Chat-Verlauf zum Abgleichen.",
      },
      {
        question: "Verlieren Kunden bei Mehrtermin-Stücken den Überblick?",
        answer:
          "Jeder Termin ist in einem Projekt klar markiert. Kunden öffnen deinen Link und sehen, welche Sitzung ansteht und wann die nächste ist.",
      },
    ],
  },
  cta: {
    title: "Weniger verpasste Termine und Wiederholungsnachrichten?",
    description:
      "Buchen? Link öffnen.\nProjekte besser managen? Jetzt registrieren.",
    loginButton: "Anmelden",
    studioButton: "Studio registrieren",
  },
  footer: {
    tagline: "Buchung & Projektverwaltung für Tattoo-Studios",
    product: "Produkt",
    account: "Konto",
    legal: "Rechtliches",
    login: "Anmelden",
    myProjects: "Meine Buchungen",
    studioRegister: "Studio registrieren",
    privacyPolicy: "Datenschutz",
    termsOfService: "Nutzungsbedingungen",
    blog: "Studio-Ratgeber",
    rights: "Alle Rechte vorbehalten.",
    contactSupportPrefix: "Fragen? Schreiben Sie uns an ",
  },
  legal: {
    privacy: {
      metaTitle: "Datenschutz",
      metaDescription:
        "Wie FLASH personenbezogene Daten auf ink-flash.com erhebt, nutzt und schützt.",
    },
    terms: {
      metaTitle: "Nutzungsbedingungen",
      metaDescription:
        "Allgemeine Geschäftsbedingungen für die FLASH Tattoo-Studio-Verwaltungsplattform.",
    },
  },
  blog: {
    metaTitle: "Tattoo-Studio-Ratgeber | FLASH",
    metaDescription:
      "Urheberrechtsschutz, rechtliche Absicherung und Praxistipps für Tattoo-Artists und Studios.",
    title: "Tattoo-Studio-Ratgeber",
    description:
      "Praxisnahe Artikel zu Designschutz, rechtlicher Absicherung und sicherem Studio-Betrieb.",
    backToBlog: "Zurück zu den Artikeln",
    readMore: "Artikel lesen",
    categories: {
      ipProtection: "Urheberrechtsschutz",
      legalSafeguards: "Rechtliche Absicherung",
      globalMarketing: "Globales Marketing",
    },
  },
};

export default dictionary;
