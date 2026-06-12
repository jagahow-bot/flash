import type { EmailDictionary } from "@/lib/i18n/email-types";

const email: EmailDictionary = {
  subjectPrefix: "[FLASH]",
  footerNotice: "FLASH 예약 알림 · 이 메일에 회신하지 마세요",
  actionClient: "예약 진행 상황 보기",
  actionStudio: "대시보드 열기",
  verification: {
    clientTitle: "고객 계정을 인증해 주세요",
    studioTitle: "스튜디오 계정을 인증해 주세요",
    clientBody:
      "아래 버튼을 클릭해 Email 인증을 완료하면 예약 요청 제출 및 알림 수신이 가능합니다.",
    studioBody:
      "아래 버튼을 클릭해 Email 인증을 완료하면 예약 관련 알림을 받을 수 있습니다.",
    buttonLabel: "Email 인증",
    linkFallback: "버튼이 작동하지 않으면 아래 링크를 브라우저에 복사하세요:",
    systemFooter: "FLASH 예약 시스템 · 이 메일에 회신하지 마세요",
  },
  newIntake: {
    title: "새 예약 요청을 받았습니다",
    body: "{clientName}님이 예약 요청({projectId})을 제출했습니다. 대시보드에서 FLASH 브리프를 확인하고 견적을 시작하세요.",
  },
  discussionClientMessage: {
    title: "예약에 새 메시지",
    body: '{authorLabel}님이 {projectId}에 메시지를 남겼습니다:\n"{preview}"',
  },
  discussionStudioReply: {
    title: "스튜디오가 답장했습니다",
    body: '{studioName}이(가) 예약 {projectId}에 답장했습니다:\n"{preview}"',
  },
  quoteSessionHint:
    " ({sessionIndex}차 견적, 총 {totalSessions}회 · 각 세션별 별도 요금)",
  quoteFirstSend: {
    title: "견적 및 예약 시간대를 보냈습니다",
    body: "{studioName}이(가) 견적과 예약 가능 시간대{sessionHint}를 보냈습니다. 로그인하여 확인하세요.",
  },
  quoteUpdatedBoth: {
    title: "견적 및 예약 시간대가 업데이트되었습니다",
    body: "{studioName}이(가) 견적과 예약 가능 시간대{sessionHint}를 업데이트했습니다. 로그인하여 확인하세요.",
  },
  quoteSlotsUpdated: {
    title: "예약 가능 시간대가 업데이트되었습니다",
    body: "{studioName}이(가) 예약 가능 시간대{sessionHint}를 업데이트했습니다. 로그인하여 선택하세요.",
  },
  quotePriceUpdated: {
    title: "견적이 업데이트되었습니다",
    body: "{studioName}이(가) 견적{sessionHint}을(를) 업데이트했습니다. 로그인하여 확인하세요.",
  },
  slotReservedClient: {
    title: "시간대가 예약됨 — 보증금 이체를 완료하세요",
    body: "선택한 시간대: {slotLabel}.\n{deadlineLabel}까지 보증금 이체를 완료해 주세요. 기한을 넘기면 예약이 자동 취소됩니다.",
  },
  slotReservedStudio: {
    title: "고객이 시간대를 선택했습니다",
    body: "{clientName}님이 {slotLabel}을(를) 선택했습니다. 보증금 기한: {deadlineLabel}.",
  },
  depositExpiredClient: {
    title: "기한 초과로 예약이 취소되었습니다",
    body: "예약 {projectId}은(는) 기한 내 보증금 이체가 완료되지 않아 취소되었고, 예약된 시간대가 해제되었습니다. 다시 예약 가능한 시간대를 선택해 주세요.",
  },
  depositExpiredStudio: {
    title: "보증금 기한 초과 — 예약 취소",
    body: "예약 {projectId}은(는) 고객이 기한 내 보증금을 완료하지 않아 취소되었고, 시간대가 해제되었습니다.",
  },
  depositSubmitted: {
    title: "고객이 보증금 증빙을 업로드했습니다",
    body: "{clientName}님이 시간대를 확인하고 보증금 증빙({projectId})을 업로드했습니다. 대시보드에서 검토하세요.",
  },
  sketchesUploaded: {
    title: "스튜디오가 디자인 시안을 업로드했습니다",
    body: "{studioName}이(가) 예약 {projectId}의 디자인 시안{countHint}을(를) 업로드했습니다. 로그인하여 확인하세요.",
  },
  finalPhotosUploaded: {
    title: "스튜디오가 완성 사진을 업로드했습니다",
    body: "{studioName}이(가) 타투 완성 사진{countHint}(예약 {projectId})을(를) 업로드했습니다. 예약 페이지에서 확인하세요.",
  },
  projectCompleted: {
    title: "예약이 완료되었습니다",
    body: "{studioName}이(가) 예약 {projectId}을(를) 완료로 표시했습니다. 예약 페이지에서 완성 사진과 사후 관리 안내를 확인하세요.",
  },
  depositConfirmedSingle: {
    title: "예약이 확정되었습니다",
    body: "{studioName}이(가) 보증금을 확인했습니다. 예약({projectId})이 확정되었습니다.",
  },
  depositConfirmedMulti: {
    title: "이번 세션 예약이 확정되었습니다",
    body: "{studioName}이(가) {sessionIndex}차 세션 보증금을 확인했습니다. 예약이 확정되었습니다. 시간에 맞춰 방문해 주세요. 시술 전 디자인 시안을 공유하고, 완료 후 완성 사진을 업로드한 뒤 다음 세션을 예약합니다.",
  },
  nextSessionReadyMulti: {
    title: "다음 세션을 예약할 수 있습니다",
    body: "{studioName}이(가) {previousSession}차 세션 작품 전달을 완료했습니다. {sessionIndex}차 세션 견적과 시간대가 준비되면 다시 알려드립니다.",
  },
  nextSessionReadySingle: {
    title: "다음 세션을 예약할 수 있습니다",
    body: "{studioName}이(가) 작품 전달을 완료했습니다. 견적과 시간대가 준비되면 다시 알려드립니다.",
  },
  preSessionSignedStudio: {
    title: "고객이 시술 전 서류에 서명했습니다",
    body: '{clientName}님이 "{documentTitle}"(예약 {projectId})에 온라인 서명했습니다. 대시보드에서 보관본을 확인하세요.',
  },
  preSessionArchivedClient: {
    title: "시술 전 서류가 보관되었습니다",
    body: '{studioName}이(가) "{documentTitle}"(예약 {projectId})을(를) 업로드하고 보관했습니다. 예약 페이지에서 확인하세요.',
  },
  studioWelcome: {
    title: "FLASH에 오신 것을 환영합니다",
    body: "안녕하세요, {studioName}님.\n\n스튜디오 설정이 완료되었습니다. FLASH는 고객 요청을 구조화된 브리프로 정리하고, 견적 관리와 예약 추적을 돕습니다.",
    nextStepsTitle: "권장 다음 단계",
    nextSteps:
      "• 아티스트를 팀에 초대하기\n• 플래시 디자인을 스토어프론트에 추가하기\n• 예약 페이지 링크를 고객과 공유하기\n• 스튜디오 설정 및 결제 정보 확인하기",
    dashboardButton: "대시보드 열기",
    bookingPageButton: "예약 페이지 보기",
  },
  countHint: " ({count}장)",
};

export default email;
