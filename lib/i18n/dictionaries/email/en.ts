import type { EmailDictionary } from "@/lib/i18n/email-types";

const email: EmailDictionary = {
  subjectPrefix: "[FLASH]",
  footerNotice: "FLASH booking notification · Do not reply to this email",
  actionClient: "View booking progress",
  actionStudio: "Open dashboard",
  verification: {
    clientTitle: "Verify your client account",
    studioTitle: "Verify your studio account",
    clientBody:
      "Click the button below to verify your Email. After verification, you can submit booking requests and receive notifications.",
    studioBody:
      "Click the button below to verify your Email. After verification, you can receive booking notifications.",
    buttonLabel: "Verify Email",
    linkFallback: "If the button does not work, copy this link into your browser:",
    systemFooter: "FLASH booking system · Do not reply to this email",
  },
  newIntake: {
    title: "New booking request received",
    body: "{clientName} submitted a booking request ({projectId}). Open the dashboard to review the FLASH brief and start quoting.",
  },
  discussionClientMessage: {
    title: "New message on a booking",
    body: '{authorLabel} left a message on {projectId}:\n"{preview}"',
  },
  discussionStudioReply: {
    title: "The studio replied to your message",
    body: '{studioName} replied on booking {projectId}:\n"{preview}"',
  },
  quoteSessionHint:
    " (Quote {sessionIndex} of {totalSessions}; each session is priced separately)",
  quoteFirstSend: {
    title: "Quote and time slots sent",
    body: "{studioName} shared a quote and available time slots{sessionHint}. Log in to review and confirm.",
  },
  quoteUpdatedBoth: {
    title: "Quote and time slots updated",
    body: "{studioName} updated the quote and available time slots{sessionHint}. Log in to review and confirm.",
  },
  quoteSlotsUpdated: {
    title: "Available time slots updated",
    body: "{studioName} updated the available time slots{sessionHint}. Log in to review and choose one.",
  },
  quotePriceUpdated: {
    title: "Quote updated",
    body: "{studioName} updated the quote{sessionHint}. Log in to review.",
  },
  slotReservedClient: {
    title: "Time slot reserved — complete deposit transfer",
    body: "You selected: {slotLabel}.\nPlease complete the deposit transfer before {deadlineLabel}. The booking will be cancelled automatically if overdue.",
  },
  slotReservedStudio: {
    title: "Client selected a time slot",
    body: "{clientName} selected {slotLabel}. Deposit deadline: {deadlineLabel}.",
  },
  depositExpiredClient: {
    title: "Booking cancelled due to overdue deposit",
    body: "Booking {projectId} was cancelled because the deposit was not received in time. The reserved slot has been released. Please choose a new time slot.",
  },
  depositExpiredStudio: {
    title: "Deposit overdue — booking cancelled",
    body: "Booking {projectId} was cancelled because the client did not complete the deposit in time. The time slot has been released.",
  },
  depositSubmitted: {
    title: "Client uploaded deposit proof",
    body: "{clientName} confirmed the time slot and uploaded deposit proof ({projectId}). Please review it in the dashboard.",
  },
  sketchesUploaded: {
    title: "Studio uploaded design drafts",
    body: "{studioName} uploaded design draft(s){countHint} for booking {projectId}. Log in to review and confirm.",
  },
  finalPhotosUploaded: {
    title: "Studio uploaded final photos",
    body: "{studioName} uploaded your tattoo final photo(s){countHint} (booking {projectId}). View them on your booking page.",
  },
  projectCompleted: {
    title: "Booking completed",
    body: "{studioName} marked booking {projectId} as completed. View final photos and aftercare guidance on your booking page.",
  },
  depositConfirmedSingle: {
    title: "Booking confirmed",
    body: "{studioName} confirmed your deposit. Your booking ({projectId}) is now confirmed.",
  },
  depositConfirmedMulti: {
    title: "This session booking is confirmed",
    body: "{studioName} confirmed the deposit for session {sessionIndex}. Your booking is confirmed. Please arrive on time. The studio will share design drafts before the session, upload final photos after, and then schedule the next session.",
  },
  nextSessionReadyMulti: {
    title: "Ready to schedule the next session",
    body: "{studioName} completed delivery for session {previousSession}. You will be notified when the quote and time slots for session {sessionIndex} are ready.",
  },
  nextSessionReadySingle: {
    title: "Ready to schedule the next session",
    body: "{studioName} completed the delivery. You will be notified when the quote and time slots are ready.",
  },
  preSessionSignedStudio: {
    title: "Client completed pre-session document signing",
    body: '{clientName} signed "{documentTitle}" online (booking {projectId}). View the archived document in the dashboard.',
  },
  preSessionArchivedClient: {
    title: "Pre-session document archived",
    body: '{studioName} uploaded and archived your "{documentTitle}" (booking {projectId}). View it on your booking page.',
  },
  studioWelcome: {
    title: "Welcome to FLASH",
    body: "Hi {studioName},\n\nYour studio is set up and ready to go. FLASH helps you turn client requests into structured briefs, manage quotes, and keep every booking on track.",
    nextStepsTitle: "Suggested next steps",
    nextSteps:
      "• Invite artists to your team\n• Add flash designs to your storefront\n• Share your booking page link with clients\n• Review your studio settings and payment info",
    dashboardButton: "Open dashboard",
    bookingPageButton: "View booking page",
  },
  countHint: " ({count} files)",
};

export default email;
