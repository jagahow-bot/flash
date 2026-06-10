import type { Locale } from "@/lib/i18n/config";
import type {
  StudioBilling,
  StudioBillingMonth,
  StudioBillingStatus,
} from "@/types/billing";

export type { StudioBillingMonth };
import type { StudioWeeklySchedule } from "@/types/operating-hours";
import type { StudioClosure } from "@/types/studio-closure";
import type { StudioOperatingHours } from "@/types/operating-hours";
import type { PreSessionDocumentTemplate } from "@/types/pre-session-document";

export type { StudioBillingStatus };

export interface StudioSocialLinks {
  /** Instagram 帳號（不含 @） */
  instagram?: string;
  /** Facebook 粉專網址或帳號名稱 */
  facebook?: string;
  /** LINE ID 或官方帳號連結 */
  line?: string;
  /** Threads 帳號（不含 @，選填） */
  threads?: string;
}

export interface Studio {
  studioId: string;
  slug: string;
  /** 預約編號前綴，例：MOHEN → MOHEN-20250608-001 */
  bookingCode?: string;
  name: string;
  logoUrl?: string;
  bio: string;
  paymentInfo: string;
  /** 客戶選定時段後，須於幾天內完成訂金轉帳（預設 3 天） */
  depositDeadlineDays?: number;
  acceptsCoverUp: boolean;
  /** 個人工作室：僅管理員一人，自動綁定為唯一刺青師 */
  isSoloStudio?: boolean;
  artists: string[];
  careGuide: string;
  weeklySchedule: StudioWeeklySchedule;
  closures: StudioClosure[];
  /** 由 weeklySchedule 換算，供排程使用 */
  operatingHours: StudioOperatingHours;
  /** 術前同意書與文件範本 */
  preSessionDocuments?: PreSessionDocumentTemplate[];
  /** 工作室社群帳號，客端預約頁顯示可點擊連結 */
  socialLinks?: StudioSocialLinks;
  /** FLASH 需求摘要輸出語言（預設 zh-Hant） */
  preferredLocale?: Locale;
  /** Stripe usage billing — defaults to active for new studios */
  billingStatus?: StudioBillingStatus;
  freeBookingsRemaining?: number;
  completedBookingsCount?: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  lastBilledMonth?: string;
}

export type StudioBillingFields = Pick<
  Studio,
  keyof StudioBilling
>;
