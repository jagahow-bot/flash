import type { EmailDictionary } from "@/lib/i18n/email-types";

const email: EmailDictionary = {
  subjectPrefix: "[FLASH]",
  footerNotice: "Notificação FLASH · Não responda a este e-mail",
  actionClient: "Ver andamento do agendamento",
  actionStudio: "Abrir painel",
  verification: {
    clientTitle: "Verifique sua conta de cliente",
    studioTitle: "Verifique sua conta de estúdio",
    clientBody:
      "Clique no botão abaixo para verificar seu Email. Depois disso, você poderá enviar pedidos de agendamento e receber notificações.",
    studioBody:
      "Clique no botão abaixo para verificar seu Email. Depois disso, você poderá receber notificações de agendamentos.",
    buttonLabel: "Verificar Email",
    linkFallback: "Se o botão não funcionar, copie este link no navegador:",
    systemFooter: "Sistema FLASH · Não responda a este e-mail",
  },
  newIntake: {
    title: "Novo pedido de agendamento recebido",
    body: "{clientName} enviou um pedido de agendamento ({projectId}). Abra o painel para revisar o brief FLASH e começar a cotar.",
  },
  discussionClientMessage: {
    title: "Nova mensagem em um agendamento",
    body: '{authorLabel} deixou uma mensagem em {projectId}:\n"{preview}"',
  },
  discussionStudioReply: {
    title: "O estúdio respondeu sua mensagem",
    body: '{studioName} respondeu no agendamento {projectId}:\n"{preview}"',
  },
  quoteSessionHint:
    " (Cotação {sessionIndex} de {totalSessions}; cada sessão é precificada separadamente)",
  quoteFirstSend: {
    title: "Cotação e horários enviados",
    body: "{studioName} enviou uma cotação e horários disponíveis{sessionHint}. Faça login para revisar e confirmar.",
  },
  quoteUpdatedBoth: {
    title: "Cotação e horários atualizados",
    body: "{studioName} atualizou a cotação e os horários disponíveis{sessionHint}. Faça login para revisar e confirmar.",
  },
  quoteSlotsUpdated: {
    title: "Horários disponíveis atualizados",
    body: "{studioName} atualizou os horários disponíveis{sessionHint}. Faça login para escolher um.",
  },
  quotePriceUpdated: {
    title: "Cotação atualizada",
    body: "{studioName} atualizou a cotação{sessionHint}. Faça login para revisar.",
  },
  slotReservedClient: {
    title: "Horário reservado — conclua a transferência do sinal",
    body: "Você selecionou: {slotLabel}.\nConclua a transferência do sinal antes de {deadlineLabel}. O agendamento será cancelado automaticamente se vencer.",
  },
  slotReservedStudio: {
    title: "Cliente selecionou um horário",
    body: "{clientName} selecionou {slotLabel}. Prazo do sinal: {deadlineLabel}.",
  },
  depositExpiredClient: {
    title: "Agendamento cancelado por sinal vencido",
    body: "O agendamento {projectId} foi cancelado porque o sinal não foi recebido a tempo. O horário reservado foi liberado. Escolha um novo horário disponível.",
  },
  depositExpiredStudio: {
    title: "Sinal vencido — agendamento cancelado",
    body: "O agendamento {projectId} foi cancelado porque o cliente não concluiu o sinal a tempo. O horário foi liberado.",
  },
  depositSubmitted: {
    title: "Cliente enviou comprovante de sinal",
    body: "{clientName} confirmou o horário e enviou o comprovante de sinal ({projectId}). Revise no painel.",
  },
  sketchesUploaded: {
    title: "Estúdio enviou rascunhos de design",
    body: "{studioName} enviou rascunho(s) de design{countHint} para o agendamento {projectId}. Faça login para revisar e confirmar.",
  },
  finalPhotosUploaded: {
    title: "Estúdio enviou fotos finais",
    body: "{studioName} enviou foto(s) final(is) da tatuagem{countHint} (agendamento {projectId}). Veja na página do agendamento.",
  },
  projectCompleted: {
    title: "Agendamento concluído",
    body: "{studioName} marcou o agendamento {projectId} como concluído. Veja as fotos finais e os cuidados pós-tatuagem na página do agendamento.",
  },
  depositConfirmedSingle: {
    title: "Agendamento confirmado",
    body: "{studioName} confirmou seu sinal. Seu agendamento ({projectId}) está confirmado.",
  },
  depositConfirmedMulti: {
    title: "Agendamento desta sessão confirmado",
    body: "{studioName} confirmou o sinal da sessão {sessionIndex}. Seu agendamento está confirmado. Chegue no horário. O estúdio compartilhará rascunhos antes da sessão, enviará fotos finais depois e então agendará a próxima sessão.",
  },
  nextSessionReadyMulti: {
    title: "Pronto para agendar a próxima sessão",
    body: "{studioName} concluiu a entrega da sessão {previousSession}. Você será avisado quando a cotação e os horários da sessão {sessionIndex} estiverem prontos.",
  },
  nextSessionReadySingle: {
    title: "Pronto para agendar a próxima sessão",
    body: "{studioName} concluiu a entrega. Você será avisado quando a cotação e os horários estiverem prontos.",
  },
  preSessionSignedStudio: {
    title: "Cliente assinou documento pré-sessão",
    body: '{clientName} assinou online "{documentTitle}" (agendamento {projectId}). Veja o arquivo no painel.',
  },
  preSessionArchivedClient: {
    title: "Documento pré-sessão arquivado",
    body: '{studioName} enviou e arquivou seu "{documentTitle}" (agendamento {projectId}). Veja na página do agendamento.',
  },
  studioWelcome: {
    title: "Bem-vindo ao FLASH",
    body: "Olá, {studioName}:\n\nSeu estúdio está configurado e pronto. O FLASH ajuda a transformar pedidos de clientes em briefs estruturados, gerenciar orçamentos e acompanhar cada agendamento.",
    nextStepsTitle: "Próximos passos sugeridos",
    nextSteps:
      "• Convide artistas para sua equipe\n• Adicione designs flash à sua vitrine\n• Compartilhe o link da página de agendamento com clientes\n• Revise as configurações do estúdio e informações de pagamento",
    dashboardButton: "Abrir painel",
    bookingPageButton: "Ver página de agendamento",
  },
  countHint: " ({count} arquivos)",
};

export default email;
