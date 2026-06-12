import type { EmailDictionary } from "@/lib/i18n/email-types";

const email: EmailDictionary = {
  subjectPrefix: "[FLASH]",
  footerNotice: "FLASH 預約系統通知 · 請勿直接回覆此信",
  actionClient: "查看預約進度",
  actionStudio: "前往後台處理",
  verification: {
    clientTitle: "請驗證您的客戶帳號",
    studioTitle: "請驗證您的工作室帳號",
    clientBody:
      "點擊下方按鈕完成 Email 驗證後，即可送出預約需求並接收通知。",
    studioBody: "點擊下方按鈕完成 Email 驗證後，即可接收預約相關通知。",
    buttonLabel: "驗證 Email",
    linkFallback: "若按鈕無法點擊，請複製以下連結到瀏覽器：",
    systemFooter: "FLASH 預約系統 · 請勿直接回覆此信",
  },
  newIntake: {
    title: "收到新的預約需求",
    body: "{clientName} 已送出預約需求（{projectId}），請至後台查看 FLASH 需求摘要並開始報價。",
  },
  discussionClientMessage: {
    title: "預約有新留言",
    body: "{authorLabel} 在 {projectId} 留下訊息：\n「{preview}」",
  },
  discussionStudioReply: {
    title: "工作室回覆了您的留言",
    body: "{studioName} 在預約 {projectId} 回覆：\n「{preview}」",
  },
  quoteSessionHint:
    "（第 {sessionIndex} 次報價，共 {totalSessions} 次；每次分開計價）",
  quoteFirstSend: {
    title: "報價與時段已送出",
    body: "{studioName} 已提供報價與可預約時段{sessionHint}，請登入查看並確認。",
  },
  quoteUpdatedBoth: {
    title: "報價與時段已更新",
    body: "{studioName} 已更新報價與可預約時段{sessionHint}，請登入查看並確認。",
  },
  quoteSlotsUpdated: {
    title: "可預約時段已更新",
    body: "{studioName} 已更新可預約時段{sessionHint}，請登入查看並擇一確認。",
  },
  quotePriceUpdated: {
    title: "報價已更新",
    body: "{studioName} 已更新報價{sessionHint}，請登入查看。",
  },
  slotReservedClient: {
    title: "時段已保留，請完成訂金轉帳",
    body: "您已選定時段：{slotLabel}。\n請於 {deadlineLabel} 前完成訂金轉帳，逾期將自動取消預約。",
  },
  slotReservedStudio: {
    title: "客戶已選定時段",
    body: "{clientName} 已選定時段（{slotLabel}），訂金期限至 {deadlineLabel}。",
  },
  depositExpiredClient: {
    title: "預約已逾期取消",
    body: "預約 {projectId} 因未於期限內完成訂金轉帳，時段保留已取消。請重新選擇可預約時段。",
  },
  depositExpiredStudio: {
    title: "客戶訂金逾期，預約已取消",
    body: "預約 {projectId} 因客戶未於期限內完成訂金轉帳，時段已釋放。",
  },
  depositSubmitted: {
    title: "客戶已上傳訂金證明",
    body: "{clientName} 已確認時段並上傳訂金證明（{projectId}），請至後台審核。",
  },
  sketchesUploaded: {
    title: "工作室已上傳設計稿",
    body: "{studioName} 已為預約 {projectId} 上傳設計稿{countHint}，請登入查看並確認。",
  },
  finalPhotosUploaded: {
    title: "工作室已上傳成品照",
    body: "{studioName} 已上傳您的刺青成品照{countHint}（預約 {projectId}），請至預約頁查看。",
  },
  projectCompleted: {
    title: "預約已完成",
    body: "{studioName} 已將預約 {projectId} 標記為完成，請至預約頁查看成品照與術後照護指引。",
  },
  depositConfirmedSingle: {
    title: "預約已成立",
    body: "{studioName} 已確認訂金，您的預約（{projectId}）已成立。",
  },
  depositConfirmedMulti: {
    title: "本次施作預約已成立",
    body: "{studioName} 已確認第 {sessionIndex} 次施作訂金，預約已成立。請準時抵達；工作室會於施作前提供設計稿供您確認，施作完成後上傳成品照，再安排下一次施作。",
  },
  nextSessionReadyMulti: {
    title: "可安排下一次施作",
    body: "{studioName} 已完成第 {previousSession} 次施作作品交付。第 {sessionIndex} 次施作的報價與時段準備好後會再通知您。",
  },
  nextSessionReadySingle: {
    title: "可安排下一次施作",
    body: "{studioName} 已完成作品交付，報價與時段準備好後會再通知您。",
  },
  preSessionSignedStudio: {
    title: "客戶已完成術前文件簽署",
    body: "{clientName} 已線上簽署「{documentTitle}」（預約 {projectId}），請至後台查看存檔。",
  },
  preSessionArchivedClient: {
    title: "術前文件已存檔",
    body: "{studioName} 已上傳並存檔您的「{documentTitle}」（預約 {projectId}），請至預約頁查看。",
  },
  studioWelcome: {
    title: "歡迎加入 FLASH",
    body: "您好，{studioName}：\n\n您的工作室已完成設定。FLASH 協助您將客戶需求轉為結構化摘要、管理報價，並追蹤每一筆預約。",
    nextStepsTitle: "建議的下一步",
    nextSteps:
      "• 邀請刺青師加入團隊\n• 上架 Flash 作品集\n• 分享預約頁面連結給客戶\n• 確認工作室設定與收款資訊",
    dashboardButton: "前往後台",
    bookingPageButton: "查看預約頁面",
  },
  countHint: "（共 {count} 張）",
};

export default email;
