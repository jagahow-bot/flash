import type { IntakeForm } from "@/types/intake-form";
import type { PreSessionDocumentRecord } from "@/types/pre-session-document";
import type { ProjectSketchRecord } from "@/types/project-sketch";
import type { SessionRecord } from "@/types/session-record";
import type { SessionDetails, TimeSlot } from "@/types/session-details";
import type { TattooBrief } from "@/types/tattoo-brief";

export type ProjectStatus =
  | "pending_brief"
  | "quoting"
  | "pending_payment"
  | "deposit_submitted"
  | "booked"
  | "completed"
  | "cancelled";

export interface Project {
  projectId: string;
  studioId: string;
  artistId: string;
  clientId: string;
  status: ProjectStatus;
  intakeForm: IntakeForm;
  tattooBrief?: TattooBrief;
  sessionDetails?: SessionDetails;
  proposedTimeSlots?: TimeSlot[];
  /** 目前已排程的 Session（1-based） */
  currentSessionIndex?: number;
  /** 各次 Session 已確認的時段 */
  confirmedTimeSlots?: TimeSlot[];
  /** 各次 Session 完整歷史（含訂金證明） */
  sessionRecords?: SessionRecord[];
  confirmedTimeSlot?: TimeSlot;
  /** 工作室請客戶修改需求 */
  pendingIntakeRevision?: boolean;
  /** 客戶上次讀取留言討論的時間 */
  clientDiscussionReadAt?: Date;
  /** 工作室上次讀取留言討論的時間 */
  studioDiscussionReadAt?: Date;
  /** 客戶上傳的訂金轉帳證明 */
  depositProofUrl?: string;
  depositSubmittedAt?: Date;
  /** 客戶選定時段（尚未付訂金）的時間 */
  slotSelectedAt?: Date;
  /** 訂金轉帳截止時間（逾時未付則釋放時段） */
  depositDeadlineAt?: Date;
  /** 設計稿版本歷程（含說明）；舊資料可由 sketches 合成 */
  sketchRecords?: ProjectSketchRecord[];
  /** 與 sketchRecords 同步，保留給舊版讀取與通知比對 */
  sketches: string[];
  finalPhotos: string[];
  privateNotes: string;
  /** 術前文件簽署紀錄 */
  preSessionDocumentRecords?: PreSessionDocumentRecord[];
  /** 工作室取消預約時間 */
  cancelledAt?: Date;
}
