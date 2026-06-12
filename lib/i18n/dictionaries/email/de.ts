import type { EmailDictionary } from "@/lib/i18n/email-types";

const email: EmailDictionary = {
  subjectPrefix: "[FLASH]",
  footerNotice: "FLASH-Buchungsbenachrichtigung · Bitte nicht antworten",
  actionClient: "Buchungsfortschritt ansehen",
  actionStudio: "Dashboard öffnen",
  verification: {
    clientTitle: "Bitte verifizieren Sie Ihr Kundenkonto",
    studioTitle: "Bitte verifizieren Sie Ihr Studio-Konto",
    clientBody:
      "Klicken Sie auf die Schaltfläche unten, um Ihre Email zu verifizieren. Danach können Sie Buchungsanfragen senden und Benachrichtigungen erhalten.",
    studioBody:
      "Klicken Sie auf die Schaltfläche unten, um Ihre Email zu verifizieren. Danach können Sie Buchungsbenachrichtigungen erhalten.",
    buttonLabel: "Email verifizieren",
    linkFallback: "Wenn die Schaltfläche nicht funktioniert, kopieren Sie diesen Link in den Browser:",
    systemFooter: "FLASH-Buchungssystem · Bitte nicht antworten",
  },
  newIntake: {
    title: "Neue Buchungsanfrage erhalten",
    body: "{clientName} hat eine Buchungsanfrage ({projectId}) gesendet. Öffnen Sie das Dashboard, um das FLASH-Briefing zu prüfen und mit dem Angebot zu beginnen.",
  },
  discussionClientMessage: {
    title: "Neue Nachricht zu einer Buchung",
    body: '{authorLabel} hat eine Nachricht zu {projectId} hinterlassen:\n"{preview}"',
  },
  discussionStudioReply: {
    title: "Das Studio hat geantwortet",
    body: '{studioName} hat auf Buchung {projectId} geantwortet:\n"{preview}"',
  },
  quoteSessionHint:
    " (Angebot {sessionIndex} von {totalSessions}; jede Sitzung wird separat berechnet)",
  quoteFirstSend: {
    title: "Angebot und Termine gesendet",
    body: "{studioName} hat ein Angebot und verfügbare Termine{sessionHint} gesendet. Bitte anmelden und prüfen.",
  },
  quoteUpdatedBoth: {
    title: "Angebot und Termine aktualisiert",
    body: "{studioName} hat Angebot und verfügbare Termine{sessionHint} aktualisiert. Bitte anmelden und prüfen.",
  },
  quoteSlotsUpdated: {
    title: "Verfügbare Termine aktualisiert",
    body: "{studioName} hat die verfügbaren Termine{sessionHint} aktualisiert. Bitte anmelden und einen auswählen.",
  },
  quotePriceUpdated: {
    title: "Angebot aktualisiert",
    body: "{studioName} hat das Angebot{sessionHint} aktualisiert. Bitte anmelden und prüfen.",
  },
  slotReservedClient: {
    title: "Termin reserviert — Anzahlung überweisen",
    body: "Sie haben gewählt: {slotLabel}.\nBitte überweisen Sie die Anzahlung bis {deadlineLabel}. Bei Überschreitung wird die Buchung automatisch storniert.",
  },
  slotReservedStudio: {
    title: "Kunde hat einen Termin gewählt",
    body: "{clientName} hat {slotLabel} gewählt. Anzahlungsfrist: {deadlineLabel}.",
  },
  depositExpiredClient: {
    title: "Buchung wegen überfälliger Anzahlung storniert",
    body: "Buchung {projectId} wurde storniert, weil die Anzahlung nicht rechtzeitig eingegangen ist. Der reservierte Termin wurde freigegeben. Bitte wählen Sie einen neuen Termin.",
  },
  depositExpiredStudio: {
    title: "Anzahlung überfällig — Buchung storniert",
    body: "Buchung {projectId} wurde storniert, weil der Kunde die Anzahlung nicht rechtzeitig abgeschlossen hat. Der Termin wurde freigegeben.",
  },
  depositSubmitted: {
    title: "Kunde hat Anzahlungsnachweis hochgeladen",
    body: "{clientName} hat den Termin bestätigt und einen Anzahlungsnachweis ({projectId}) hochgeladen. Bitte im Dashboard prüfen.",
  },
  sketchesUploaded: {
    title: "Studio hat Designentwürfe hochgeladen",
    body: "{studioName} hat Designentwürfe{countHint} für Buchung {projectId} hochgeladen. Bitte anmelden und prüfen.",
  },
  finalPhotosUploaded: {
    title: "Studio hat Endfotos hochgeladen",
    body: "{studioName} hat Endfoto(s) Ihres Tattoos{countHint} hochgeladen (Buchung {projectId}). Auf der Buchungsseite ansehen.",
  },
  projectCompleted: {
    title: "Buchung abgeschlossen",
    body: "{studioName} hat Buchung {projectId} als abgeschlossen markiert. Endfotos und Nachsorge auf der Buchungsseite ansehen.",
  },
  depositConfirmedSingle: {
    title: "Buchung bestätigt",
    body: "{studioName} hat Ihre Anzahlung bestätigt. Ihre Buchung ({projectId}) ist bestätigt.",
  },
  depositConfirmedMulti: {
    title: "Buchung für diese Sitzung bestätigt",
    body: "{studioName} hat die Anzahlung für Sitzung {sessionIndex} bestätigt. Ihre Buchung ist bestätigt. Bitte pünktlich erscheinen. Das Studio teilt Entwürfe vor der Sitzung, lädt danach Endfotos hoch und plant die nächste Sitzung.",
  },
  nextSessionReadyMulti: {
    title: "Nächste Sitzung kann geplant werden",
    body: "{studioName} hat die Lieferung für Sitzung {previousSession} abgeschlossen. Sie werden benachrichtigt, wenn Angebot und Termine für Sitzung {sessionIndex} bereit sind.",
  },
  nextSessionReadySingle: {
    title: "Nächste Sitzung kann geplant werden",
    body: "{studioName} hat die Lieferung abgeschlossen. Sie werden benachrichtigt, wenn Angebot und Termine bereit sind.",
  },
  preSessionSignedStudio: {
    title: "Kunde hat Vorsession-Dokument unterschrieben",
    body: '{clientName} hat "{documentTitle}" online unterschrieben (Buchung {projectId}). Archiv im Dashboard ansehen.',
  },
  preSessionArchivedClient: {
    title: "Vorsession-Dokument archiviert",
    body: '{studioName} hat Ihr "{documentTitle}" hochgeladen und archiviert (Buchung {projectId}). Auf der Buchungsseite ansehen.',
  },
  countHint: " ({count} Dateien)",
};

export default email;
