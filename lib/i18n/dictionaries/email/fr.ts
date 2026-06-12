import type { EmailDictionary } from "@/lib/i18n/email-types";

const email: EmailDictionary = {
  subjectPrefix: "[FLASH]",
  footerNotice: "Notification FLASH · Ne pas répondre à cet e-mail",
  actionClient: "Voir l'avancement de la réservation",
  actionStudio: "Ouvrir le tableau de bord",
  verification: {
    clientTitle: "Vérifiez votre compte client",
    studioTitle: "Vérifiez votre compte studio",
    clientBody:
      "Cliquez sur le bouton ci-dessous pour vérifier votre Email. Vous pourrez ensuite envoyer des demandes de réservation et recevoir des notifications.",
    studioBody:
      "Cliquez sur le bouton ci-dessous pour vérifier votre Email. Vous pourrez ensuite recevoir des notifications de réservation.",
    buttonLabel: "Vérifier l'Email",
    linkFallback: "Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :",
    systemFooter: "Système FLASH · Ne pas répondre à cet e-mail",
  },
  newIntake: {
    title: "Nouvelle demande de réservation reçue",
    body: "{clientName} a envoyé une demande de réservation ({projectId}). Ouvrez le tableau de bord pour consulter le brief FLASH et commencer le devis.",
  },
  discussionClientMessage: {
    title: "Nouveau message sur une réservation",
    body: '{authorLabel} a laissé un message sur {projectId} :\n"{preview}"',
  },
  discussionStudioReply: {
    title: "Le studio a répondu à votre message",
    body: '{studioName} a répondu sur la réservation {projectId} :\n"{preview}"',
  },
  quoteSessionHint:
    " (Devis {sessionIndex} sur {totalSessions} ; chaque session est facturée séparément)",
  quoteFirstSend: {
    title: "Devis et créneaux envoyés",
    body: "{studioName} a partagé un devis et des créneaux disponibles{sessionHint}. Connectez-vous pour consulter et confirmer.",
  },
  quoteUpdatedBoth: {
    title: "Devis et créneaux mis à jour",
    body: "{studioName} a mis à jour le devis et les créneaux disponibles{sessionHint}. Connectez-vous pour consulter et confirmer.",
  },
  quoteSlotsUpdated: {
    title: "Créneaux disponibles mis à jour",
    body: "{studioName} a mis à jour les créneaux disponibles{sessionHint}. Connectez-vous pour en choisir un.",
  },
  quotePriceUpdated: {
    title: "Devis mis à jour",
    body: "{studioName} a mis à jour le devis{sessionHint}. Connectez-vous pour consulter.",
  },
  slotReservedClient: {
    title: "Créneau réservé — effectuez le virement de l'acompte",
    body: "Vous avez choisi : {slotLabel}.\nVeuillez effectuer le virement de l'acompte avant le {deadlineLabel}. La réservation sera annulée automatiquement en cas de retard.",
  },
  slotReservedStudio: {
    title: "Le client a choisi un créneau",
    body: "{clientName} a choisi {slotLabel}. Date limite de l'acompte : {deadlineLabel}.",
  },
  depositExpiredClient: {
    title: "Réservation annulée — acompte en retard",
    body: "La réservation {projectId} a été annulée car l'acompte n'a pas été reçu à temps. Le créneau réservé a été libéré. Veuillez choisir un nouveau créneau.",
  },
  depositExpiredStudio: {
    title: "Acompte en retard — réservation annulée",
    body: "La réservation {projectId} a été annulée car le client n'a pas finalisé l'acompte à temps. Le créneau a été libéré.",
  },
  depositSubmitted: {
    title: "Le client a téléversé une preuve d'acompte",
    body: "{clientName} a confirmé le créneau et téléversé une preuve d'acompte ({projectId}). Veuillez la vérifier dans le tableau de bord.",
  },
  sketchesUploaded: {
    title: "Le studio a téléversé des croquis",
    body: "{studioName} a téléversé des croquis{countHint} pour la réservation {projectId}. Connectez-vous pour consulter et confirmer.",
  },
  finalPhotosUploaded: {
    title: "Le studio a téléversé des photos finales",
    body: "{studioName} a téléversé la ou les photo(s) finale(s) de votre tatouage{countHint} (réservation {projectId}). Consultez-les sur votre page de réservation.",
  },
  projectCompleted: {
    title: "Réservation terminée",
    body: "{studioName} a marqué la réservation {projectId} comme terminée. Consultez les photos finales et les conseils de soins sur votre page de réservation.",
  },
  depositConfirmedSingle: {
    title: "Réservation confirmée",
    body: "{studioName} a confirmé votre acompte. Votre réservation ({projectId}) est confirmée.",
  },
  depositConfirmedMulti: {
    title: "Réservation de cette session confirmée",
    body: "{studioName} a confirmé l'acompte de la session {sessionIndex}. Votre réservation est confirmée. Veuillez arriver à l'heure. Le studio partagera des croquis avant la session, téléversera les photos finales après, puis planifiera la session suivante.",
  },
  nextSessionReadyMulti: {
    title: "Prêt à planifier la prochaine session",
    body: "{studioName} a terminé la livraison de la session {previousSession}. Vous serez averti lorsque le devis et les créneaux de la session {sessionIndex} seront prêts.",
  },
  nextSessionReadySingle: {
    title: "Prêt à planifier la prochaine session",
    body: "{studioName} a terminé la livraison. Vous serez averti lorsque le devis et les créneaux seront prêts.",
  },
  preSessionSignedStudio: {
    title: "Le client a signé un document pré-session",
    body: '{clientName} a signé en ligne « {documentTitle} » (réservation {projectId}). Consultez l\'archive dans le tableau de bord.',
  },
  preSessionArchivedClient: {
    title: "Document pré-session archivé",
    body: '{studioName} a téléversé et archivé votre « {documentTitle} » (réservation {projectId}). Consultez-le sur votre page de réservation.',
  },
  studioWelcome: {
    title: "Bienvenue sur FLASH",
    body: "Bonjour {studioName},\n\nVotre studio est configuré et prêt. FLASH vous aide à transformer les demandes clients en briefs structurés, à gérer les devis et à suivre chaque réservation.",
    nextStepsTitle: "Prochaines étapes suggérées",
    nextSteps:
      "• Inviter des artistes dans votre équipe\n• Ajouter des flashs à votre vitrine\n• Partager le lien de votre page de réservation avec vos clients\n• Vérifier les paramètres du studio et les informations de paiement",
    dashboardButton: "Ouvrir le tableau de bord",
    bookingPageButton: "Voir la page de réservation",
  },
  countHint: " ({count} fichiers)",
};

export default email;
