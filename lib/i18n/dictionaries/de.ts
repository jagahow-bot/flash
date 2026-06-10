import type { LandingDictionary } from "@/lib/i18n/types";

const dictionary: LandingDictionary = {
  locale: "de",
  meta: {
    title: "FLASH — Buchung & Projektverwaltung für Tattoo-Studios",
    description:
      "Tattoo-Studio-Buchungssystem: weniger verpasste Termine, weniger Wiederholungsnachrichten. Anfragen, Angebote, Terminplanung, Anzahlungen und Mehrtermin-Buchungen zentral verwalten.",
    keywords: [
      "Tattoo Buchung",
      "Tattoo Studio Verwaltung",
      "Tattoo Shop Software",
      "FLASH",
      "Tattoo Anzahlung",
      "Mehrtermin Tattoo",
      "Tattoo Projektverwaltung",
      "Tattoo Kundenverwaltung",
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
    heading: "Buchung & Projektverwaltung für Tattoo-Studios",
    subtitle:
      "Weniger verpasste Termine, weniger Wiederholungsnachrichten —\ndamit du dich aufs Tätowieren konzentrieren kannst",
    description:
      "Kein Neuanfang mehr in den DMs —\ndu und deine Kunden wissen immer, was als Nächstes ansteht.",
    ctaLogin: "Anmelden",
    ctaRegisterStudio: "Studio registrieren",
  },
  about: {
    title: "Was ist FLASH?",
    paragraphs: [
      "Ein Tattoo-Studio-Buchungssystem für Projekte von Anfang bis Ende.\nInhaber und Artists verwalten Projekte im Backend; Kunden stellen Anfragen und prüfen den Fortschritt selbst — getrennte Wege, synchronisierte Daten.",
      "Kommt dir bekannt vor? Kunden erklären nur die Hälfte, Anzahlungen passen nicht zur Buchhaltung, Mehrtermin-Projekte vermischen sich und die Nachrichten fragen ständig «Wie ist der Stand?»\nFLASH bündelt das an einem Ort: von der Anfrage über Angebot und Termin bis zur Anzahlung und Mehrtermin-Buchung — klare Schritte, klare Aufzeichnungen.",
      "Kunden starten über deinen Link ein Projekt; du öffnest das Backend, wenn du daran arbeiten willst.",
    ],
  },
  features: {
    title: "Was Studios Zeit spart",
    subtitle:
      "Die Stellen, an denen Termine durchrutschen —\nohne sich nur aufs Gedächtnis zu verlassen",
    items: [
      {
        title: "Verstehen, was Kunden meinen",
        schemaName: "KI-Anfrage-Zusammenfassung",
        description:
          "Vage Anfragen, klare Punkte beim Öffnen —\ndu weißt vor dem Angebot, worauf du dich einlässt.",
      },
      {
        title: "Angebote ohne endloses Hin und Her",
        schemaName: "Angebot und Terminplanung",
        description:
          "Neue Projekte an einem Ort, Zeiten schicken wenn du bereit bist —\nKunden wählen; du konzentrierst dich auf die Kunst.",
      },
      {
        title: "Anzahlungen, die stimmen",
        schemaName: "Anzahlungsverfolgung",
        description:
          "Wer gezahlt hat, wie viel — alles dokumentiert.\nKein Chat-Verlauf zum Abgleichen.",
      },
      {
        title: "Mehrtermin-Stücke, trotzdem klar",
        schemaName: "Mehrtermin-Buchungen",
        description:
          "Welche Sitzung, wann die nächste —\ndu und dein Kunde sehen es deutlich.",
      },
    ],
  },
  howItWorks: {
    title: "So funktioniert's",
    subtitle: "Kunden und Studio, jeder mit eigenem Ablauf —\nder Fortschritt bleibt synchron",
    clientTitle: "Für Kunden",
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
    studioTitle: "Für Studios",
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
  faq: {
    title: "Häufige Fragen",
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
    login: "Anmelden",
    myProjects: "Meine Buchungen",
    studioRegister: "Studio registrieren",
    rights: "Alle Rechte vorbehalten.",
    contactSupportPrefix: "Fragen? Schreiben Sie uns an ",
  },
};

export default dictionary;
