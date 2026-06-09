import type { TimeSlot } from "@/types/session-details";

/** 每次 Session 確認後的歷史紀錄 */
export interface SessionRecord {
  /** 1-based */
  sessionIndex: number;
  confirmedTimeSlot: TimeSlot;
  depositProofUrl?: string;
  depositSubmittedAt?: Date;
  confirmedAt?: Date;
  /** 工作室標記本次 Session 作品交付完成（設計稿／成品照） */
  deliveryCompletedAt?: Date;
}
