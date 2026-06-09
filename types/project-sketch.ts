export interface ProjectSketchRecord {
  id: string;
  url: string;
  uploadedAt: Date;
  /** 工作室版本說明，最長約 120 字 */
  note?: string;
  /** 上傳時所屬 Session（1-based） */
  sessionIndex?: number;
  uploadedByUserId?: string;
}
