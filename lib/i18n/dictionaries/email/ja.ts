import type { EmailDictionary } from "@/lib/i18n/email-types";

const email: EmailDictionary = {
  subjectPrefix: "[FLASH]",
  footerNotice: "FLASH予約通知 · このメールには返信しないでください",
  actionClient: "予約進捗を見る",
  actionStudio: "ダッシュボードを開く",
  verification: {
    clientTitle: "クライアントアカウントを認証してください",
    studioTitle: "スタジオアカウントを認証してください",
    clientBody:
      "下のボタンをクリックしてEmail認証を完了すると、予約リクエストの送信と通知の受信が可能になります。",
    studioBody:
      "下のボタンをクリックしてEmail認証を完了すると、予約関連の通知を受信できます。",
    buttonLabel: "Emailを認証",
    linkFallback: "ボタンが機能しない場合は、以下のリンクをブラウザにコピーしてください：",
    systemFooter: "FLASH予約システム · このメールには返信しないでください",
  },
  newIntake: {
    title: "新しい予約リクエストを受信しました",
    body: "{clientName} さんが予約リクエスト（{projectId}）を送信しました。ダッシュボードでFLASHブリーフを確認し、見積もりを開始してください。",
  },
  discussionClientMessage: {
    title: "予約に新しいメッセージ",
    body: "{authorLabel} さんが {projectId} にメッセージを残しました：\n「{preview}」",
  },
  discussionStudioReply: {
    title: "スタジオから返信がありました",
    body: "{studioName} が予約 {projectId} に返信しました：\n「{preview}」",
  },
  quoteSessionHint:
    "（{sessionIndex}回目の見積もり、全{totalSessions}回 · 各セッションは個別に料金設定）",
  quoteFirstSend: {
    title: "見積もりと予約枠を送信しました",
    body: "{studioName} が見積もりと予約可能な時間枠{sessionHint}を送信しました。ログインして確認してください。",
  },
  quoteUpdatedBoth: {
    title: "見積もりと予約枠を更新しました",
    body: "{studioName} が見積もりと予約可能な時間枠{sessionHint}を更新しました。ログインして確認してください。",
  },
  quoteSlotsUpdated: {
    title: "予約可能な時間枠を更新しました",
    body: "{studioName} が予約可能な時間枠{sessionHint}を更新しました。ログインして選択してください。",
  },
  quotePriceUpdated: {
    title: "見積もりを更新しました",
    body: "{studioName} が見積もり{sessionHint}を更新しました。ログインして確認してください。",
  },
  slotReservedClient: {
    title: "時間枠を確保しました — デポジット振込を完了してください",
    body: "選択した時間枠：{slotLabel}。\n{deadlineLabel} までにデポジット振込を完了してください。期限を過ぎると予約は自動キャンセルされます。",
  },
  slotReservedStudio: {
    title: "クライアントが時間枠を選択しました",
    body: "{clientName} さんが {slotLabel} を選択しました。デポジット期限：{deadlineLabel}。",
  },
  depositExpiredClient: {
    title: "期限超過により予約がキャンセルされました",
    body: "予約 {projectId} はデポジット期限内に振込が完了しなかったためキャンセルされ、時間枠の確保は解除されました。再度予約可能な時間枠を選択してください。",
  },
  depositExpiredStudio: {
    title: "デポジット期限超過 — 予約キャンセル",
    body: "予約 {projectId} はクライアントが期限内にデポジットを完了しなかったためキャンセルされ、時間枠が解放されました。",
  },
  depositSubmitted: {
    title: "クライアントがデポジット証明をアップロードしました",
    body: "{clientName} さんが時間枠を確認し、デポジット証明（{projectId}）をアップロードしました。ダッシュボードで審査してください。",
  },
  sketchesUploaded: {
    title: "スタジオがデザイン稿をアップロードしました",
    body: "{studioName} が予約 {projectId} のデザイン稿{countHint}をアップロードしました。ログインして確認してください。",
  },
  finalPhotosUploaded: {
    title: "スタジオが完成写真をアップロードしました",
    body: "{studioName} がタトゥーの完成写真{countHint}（予約 {projectId}）をアップロードしました。予約ページでご確認ください。",
  },
  projectCompleted: {
    title: "予約が完了しました",
    body: "{studioName} が予約 {projectId} を完了としてマークしました。予約ページで完成写真とアフターケアをご確認ください。",
  },
  depositConfirmedSingle: {
    title: "予約が確定しました",
    body: "{studioName} がデポジットを確認しました。予約（{projectId}）が確定しました。",
  },
  depositConfirmedMulti: {
    title: "今回のセッション予約が確定しました",
    body: "{studioName} が第{sessionIndex}回セッションのデポジットを確認しました。予約が確定しました。時間通りにお越しください。施作前にデザイン稿を共有し、完了後に完成写真をアップロードしてから次のセッションを調整します。",
  },
  nextSessionReadyMulti: {
    title: "次のセッションを調整できます",
    body: "{studioName} が第{previousSession}回セッションの作品納品を完了しました。第{sessionIndex}回セッションの見積もりと時間枠が準備でき次第、再度お知らせします。",
  },
  nextSessionReadySingle: {
    title: "次のセッションを調整できます",
    body: "{studioName} が作品納品を完了しました。見積もりと時間枠が準備でき次第、再度お知らせします。",
  },
  preSessionSignedStudio: {
    title: "クライアントが術前書類に署名しました",
    body: "{clientName} さんが「{documentTitle}」（予約 {projectId}）にオンライン署名しました。ダッシュボードでアーカイブを確認してください。",
  },
  preSessionArchivedClient: {
    title: "術前書類がアーカイブされました",
    body: "{studioName} が「{documentTitle}」（予約 {projectId}）をアップロードしてアーカイブしました。予約ページでご確認ください。",
  },
  studioWelcome: {
    title: "FLASH へようこそ",
    body: "{studioName} 様\n\nスタジオのセットアップが完了しました。FLASH はお客様のリクエストを構造化されたブリーフに変換し、見積もり管理と予約の追跡をサポートします。",
    nextStepsTitle: "おすすめの次のステップ",
    nextSteps:
      "• アーティストをチームに招待する\n• フラッシュデザインをストアフロントに追加する\n• 予約ページのリンクをクライアントと共有する\n• スタジオ設定と支払い情報を確認する",
    dashboardButton: "ダッシュボードを開く",
    bookingPageButton: "予約ページを見る",
  },
  countHint: "（{count}枚）",
};

export default email;
