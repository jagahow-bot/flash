export interface EmailDictionary {
  subjectPrefix: string;
  footerNotice: string;
  actionClient: string;
  actionStudio: string;
  verification: {
    clientTitle: string;
    studioTitle: string;
    clientBody: string;
    studioBody: string;
    buttonLabel: string;
    linkFallback: string;
    systemFooter: string;
  };
  newIntake: {
    title: string;
    body: string;
  };
  discussionClientMessage: {
    title: string;
    body: string;
  };
  discussionStudioReply: {
    title: string;
    body: string;
  };
  quoteSessionHint: string;
  quoteFirstSend: {
    title: string;
    body: string;
  };
  quoteUpdatedBoth: {
    title: string;
    body: string;
  };
  quoteSlotsUpdated: {
    title: string;
    body: string;
  };
  quotePriceUpdated: {
    title: string;
    body: string;
  };
  slotReservedClient: {
    title: string;
    body: string;
  };
  slotReservedStudio: {
    title: string;
    body: string;
  };
  depositExpiredClient: {
    title: string;
    body: string;
  };
  depositExpiredStudio: {
    title: string;
    body: string;
  };
  depositSubmitted: {
    title: string;
    body: string;
  };
  sketchesUploaded: {
    title: string;
    body: string;
  };
  finalPhotosUploaded: {
    title: string;
    body: string;
  };
  projectCompleted: {
    title: string;
    body: string;
  };
  depositConfirmedSingle: {
    title: string;
    body: string;
  };
  depositConfirmedMulti: {
    title: string;
    body: string;
  };
  nextSessionReadyMulti: {
    title: string;
    body: string;
  };
  nextSessionReadySingle: {
    title: string;
    body: string;
  };
  preSessionSignedStudio: {
    title: string;
    body: string;
  };
  preSessionArchivedClient: {
    title: string;
    body: string;
  };
  countHint: string;
}
