import type { EmailDictionary } from "@/lib/i18n/email-types";

const email: EmailDictionary = {
  subjectPrefix: "[FLASH]",
  footerNotice: "Notificación FLASH · No responda a este correo",
  actionClient: "Ver progreso de la reserva",
  actionStudio: "Abrir panel",
  verification: {
    clientTitle: "Verifica tu cuenta de cliente",
    studioTitle: "Verifica tu cuenta de estudio",
    clientBody:
      "Haz clic en el botón para verificar tu Email. Después podrás enviar solicitudes de reserva y recibir notificaciones.",
    studioBody:
      "Haz clic en el botón para verificar tu Email. Después podrás recibir notificaciones de reservas.",
    buttonLabel: "Verificar Email",
    linkFallback: "Si el botón no funciona, copia este enlace en tu navegador:",
    systemFooter: "Sistema FLASH · No responda a este correo",
  },
  newIntake: {
    title: "Nueva solicitud de reserva recibida",
    body: "{clientName} envió una solicitud de reserva ({projectId}). Abre el panel para revisar el brief FLASH y comenzar a cotizar.",
  },
  discussionClientMessage: {
    title: "Nuevo mensaje en una reserva",
    body: '{authorLabel} dejó un mensaje en {projectId}:\n"{preview}"',
  },
  discussionStudioReply: {
    title: "El estudio respondió tu mensaje",
    body: '{studioName} respondió en la reserva {projectId}:\n"{preview}"',
  },
  quoteSessionHint:
    " (Cotización {sessionIndex} de {totalSessions}; cada sesión se cotiza por separado)",
  quoteFirstSend: {
    title: "Cotización y horarios enviados",
    body: "{studioName} compartió una cotización y horarios disponibles{sessionHint}. Inicia sesión para revisar y confirmar.",
  },
  quoteUpdatedBoth: {
    title: "Cotización y horarios actualizados",
    body: "{studioName} actualizó la cotización y los horarios disponibles{sessionHint}. Inicia sesión para revisar y confirmar.",
  },
  quoteSlotsUpdated: {
    title: "Horarios disponibles actualizados",
    body: "{studioName} actualizó los horarios disponibles{sessionHint}. Inicia sesión para elegir uno.",
  },
  quotePriceUpdated: {
    title: "Cotización actualizada",
    body: "{studioName} actualizó la cotización{sessionHint}. Inicia sesión para revisar.",
  },
  slotReservedClient: {
    title: "Horario reservado — completa la transferencia del depósito",
    body: "Seleccionaste: {slotLabel}.\nCompleta la transferencia del depósito antes del {deadlineLabel}. La reserva se cancelará automáticamente si se vence.",
  },
  slotReservedStudio: {
    title: "El cliente seleccionó un horario",
    body: "{clientName} seleccionó {slotLabel}. Plazo del depósito: {deadlineLabel}.",
  },
  depositExpiredClient: {
    title: "Reserva cancelada por depósito vencido",
    body: "La reserva {projectId} se canceló porque no se recibió el depósito a tiempo. El horario reservado fue liberado. Elige un nuevo horario disponible.",
  },
  depositExpiredStudio: {
    title: "Depósito vencido — reserva cancelada",
    body: "La reserva {projectId} se canceló porque el cliente no completó el depósito a tiempo. El horario fue liberado.",
  },
  depositSubmitted: {
    title: "El cliente subió comprobante de depósito",
    body: "{clientName} confirmó el horario y subió el comprobante de depósito ({projectId}). Revísalo en el panel.",
  },
  sketchesUploaded: {
    title: "El estudio subió borradores de diseño",
    body: "{studioName} subió borrador(es) de diseño{countHint} para la reserva {projectId}. Inicia sesión para revisar y confirmar.",
  },
  finalPhotosUploaded: {
    title: "El estudio subió fotos finales",
    body: "{studioName} subió foto(s) final(es) del tatuaje{countHint} (reserva {projectId}). Míralas en tu página de reserva.",
  },
  projectCompleted: {
    title: "Reserva completada",
    body: "{studioName} marcó la reserva {projectId} como completada. Consulta las fotos finales y el cuidado posterior en tu página de reserva.",
  },
  depositConfirmedSingle: {
    title: "Reserva confirmada",
    body: "{studioName} confirmó tu depósito. Tu reserva ({projectId}) está confirmada.",
  },
  depositConfirmedMulti: {
    title: "Reserva de esta sesión confirmada",
    body: "{studioName} confirmó el depósito de la sesión {sessionIndex}. Tu reserva está confirmada. Llega a tiempo. El estudio compartirá borradores antes de la sesión, subirá fotos finales después y luego programará la siguiente sesión.",
  },
  nextSessionReadyMulti: {
    title: "Listo para programar la siguiente sesión",
    body: "{studioName} completó la entrega de la sesión {previousSession}. Te avisaremos cuando la cotización y los horarios de la sesión {sessionIndex} estén listos.",
  },
  nextSessionReadySingle: {
    title: "Listo para programar la siguiente sesión",
    body: "{studioName} completó la entrega. Te avisaremos cuando la cotización y los horarios estén listos.",
  },
  preSessionSignedStudio: {
    title: "El cliente firmó un documento pre-sesión",
    body: '{clientName} firmó en línea "{documentTitle}" (reserva {projectId}). Consulta el archivo en el panel.',
  },
  preSessionArchivedClient: {
    title: "Documento pre-sesión archivado",
    body: '{studioName} subió y archivó tu "{documentTitle}" (reserva {projectId}). Consúltalo en tu página de reserva.',
  },
  studioWelcome: {
    title: "Bienvenido a FLASH",
    body: "Hola, {studioName}:\n\nTu estudio ya está configurado. FLASH te ayuda a convertir las solicitudes de clientes en briefs estructurados, gestionar cotizaciones y hacer seguimiento de cada reserva.",
    nextStepsTitle: "Próximos pasos sugeridos",
    nextSteps:
      "• Invita artistas a tu equipo\n• Añade diseños flash a tu escaparate\n• Comparte el enlace de tu página de reservas con clientes\n• Revisa la configuración del estudio y la información de pago",
    dashboardButton: "Abrir panel",
    bookingPageButton: "Ver página de reservas",
  },
  countHint: " ({count} archivos)",
};

export default email;
