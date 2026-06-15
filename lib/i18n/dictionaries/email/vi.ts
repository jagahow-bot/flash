import type { EmailDictionary } from "@/lib/i18n/email-types";

const email: EmailDictionary = {
  subjectPrefix: "[FLASH]",
  footerNotice: "Thông báo đặt lịch FLASH · Vui lòng không trả lời email này",
  actionClient: "Xem tiến độ đặt lịch",
  actionStudio: "Mở bảng điều khiển",
  verification: {
    clientTitle: "Xác minh tài khoản khách hàng",
    studioTitle: "Xác minh tài khoản studio",
    clientBody:
      "Nhấn nút bên dưới để xác minh Email. Sau khi xác minh, bạn có thể gửi yêu cầu đặt lịch và nhận thông báo.",
    studioBody:
      "Nhấn nút bên dưới để xác minh Email. Sau khi xác minh, bạn có thể nhận thông báo đặt lịch.",
    buttonLabel: "Xác minh Email",
    linkFallback: "Nếu nút không hoạt động, hãy sao chép liên kết này vào trình duyệt:",
    systemFooter: "Hệ thống đặt lịch FLASH · Vui lòng không trả lời email này",
  },
  newIntake: {
    title: "Đã nhận yêu cầu đặt lịch mới",
    body: "{clientName} đã gửi yêu cầu đặt lịch ({projectId}). Mở bảng điều khiển để xem tóm tắt FLASH và bắt đầu báo giá.",
  },
  discussionClientMessage: {
    title: "Tin nhắn mới trong lịch đặt",
    body: '{authorLabel} đã để lại tin nhắn trong {projectId}:\n"{preview}"',
  },
  discussionStudioReply: {
    title: "Studio đã trả lời tin nhắn của bạn",
    body: '{studioName} đã trả lời trong lịch đặt {projectId}:\n"{preview}"',
  },
  quoteSessionHint:
    " (Báo giá {sessionIndex}/{totalSessions}; mỗi buổi được tính giá riêng)",
  quoteFirstSend: {
    title: "Đã gửi báo giá và khung giờ",
    body: "{studioName} đã chia sẻ báo giá và khung giờ trống{sessionHint}. Đăng nhập để xem và xác nhận.",
  },
  quoteUpdatedBoth: {
    title: "Đã cập nhật báo giá và khung giờ",
    body: "{studioName} đã cập nhật báo giá và khung giờ trống{sessionHint}. Đăng nhập để xem và xác nhận.",
  },
  quoteSlotsUpdated: {
    title: "Đã cập nhật khung giờ trống",
    body: "{studioName} đã cập nhật khung giờ trống{sessionHint}. Đăng nhập để xem và chọn.",
  },
  quotePriceUpdated: {
    title: "Đã cập nhật báo giá",
    body: "{studioName} đã cập nhật báo giá{sessionHint}. Đăng nhập để xem.",
  },
  slotReservedClient: {
    title: "Đã giữ khung giờ — hoàn tất chuyển cọc",
    body: "Bạn đã chọn: {slotLabel}.\nVui lòng hoàn tất chuyển cọc trước {deadlineLabel}. Lịch đặt sẽ tự động hủy nếu quá hạn.",
  },
  slotReservedStudio: {
    title: "Khách đã chọn khung giờ",
    body: "{clientName} đã chọn {slotLabel}. Hạn chót cọc: {deadlineLabel}.",
  },
  depositExpiredClient: {
    title: "Lịch đặt bị hủy do cọc quá hạn",
    body: "Lịch đặt {projectId} đã bị hủy vì không nhận được cọc đúng hạn. Khung giờ đã được giải phóng. Vui lòng chọn khung giờ mới.",
  },
  depositExpiredStudio: {
    title: "Cọc quá hạn — lịch đặt bị hủy",
    body: "Lịch đặt {projectId} đã bị hủy vì khách không hoàn tất cọc đúng hạn. Khung giờ đã được giải phóng.",
  },
  depositSubmitted: {
    title: "Khách đã tải lên chứng từ cọc",
    body: "{clientName} đã xác nhận khung giờ và tải lên chứng từ cọc ({projectId}). Vui lòng kiểm tra trong bảng điều khiển.",
  },
  sketchesUploaded: {
    title: "Studio đã tải lên bản phác thảo",
    body: "{studioName} đã tải lên bản phác thảo{countHint} cho lịch đặt {projectId}. Đăng nhập để xem và xác nhận.",
  },
  finalPhotosUploaded: {
    title: "Studio đã tải lên ảnh hoàn thành",
    body: "{studioName} đã tải lên ảnh xăm hoàn thành{countHint} (lịch đặt {projectId}). Xem trên trang lịch đặt của bạn.",
  },
  projectCompleted: {
    title: "Lịch đặt đã hoàn tất",
    body: "{studioName} đã đánh dấu lịch đặt {projectId} là hoàn tất. Xem ảnh hoàn thành và hướng dẫn chăm sóc trên trang lịch đặt.",
  },
  depositConfirmedSingle: {
    title: "Lịch đặt đã xác nhận",
    body: "{studioName} đã xác nhận cọc của bạn. Lịch đặt ({projectId}) của bạn đã được xác nhận.",
  },
  depositConfirmedMulti: {
    title: "Lịch đặt buổi này đã xác nhận",
    body: "{studioName} đã xác nhận cọc cho buổi {sessionIndex}. Lịch đặt của bạn đã được xác nhận. Vui lòng đến đúng giờ. Studio sẽ chia sẻ phác thảo trước buổi, tải ảnh hoàn thành sau đó và sắp buổi tiếp theo.",
  },
  nextSessionReadyMulti: {
    title: "Sẵn sàng sắp buổi tiếp theo",
    body: "{studioName} đã hoàn tất giao hàng cho buổi {previousSession}. Bạn sẽ được thông báo khi báo giá và khung giờ cho buổi {sessionIndex} sẵn sàng.",
  },
  nextSessionReadySingle: {
    title: "Sẵn sàng sắp buổi tiếp theo",
    body: "{studioName} đã hoàn tất giao hàng. Bạn sẽ được thông báo khi báo giá và khung giờ sẵn sàng.",
  },
  preSessionSignedStudio: {
    title: "Khách đã ký tài liệu trước buổi",
    body: '{clientName} đã ký "{documentTitle}" trực tuyến (lịch đặt {projectId}). Xem tài liệu lưu trữ trong bảng điều khiển.',
  },
  preSessionArchivedClient: {
    title: "Tài liệu trước buổi đã lưu trữ",
    body: '{studioName} đã tải lên và lưu trữ "{documentTitle}" (lịch đặt {projectId}) của bạn. Xem trên trang lịch đặt.',
  },
  studioWelcome: {
    title: "Chào mừng đến với FLASH",
    body: "Xin chào {studioName},\n\nStudio của bạn đã sẵn sàng. FLASH giúp bạn chuyển yêu cầu khách thành brief có cấu trúc, quản lý báo giá và theo dõi mọi lịch đặt.",
    nextStepsTitle: "Các bước tiếp theo đề xuất",
    nextSteps:
      "• Mời nghệ sĩ vào đội ngũ\n• Thêm flash design vào cửa hàng\n• Chia sẻ liên kết trang đặt lịch với khách\n• Xem lại cài đặt studio và thông tin thanh toán",
    dashboardButton: "Mở bảng điều khiển",
    bookingPageButton: "Xem trang đặt lịch",
  },
  countHint: " ({count} tệp)",
};

export default email;
