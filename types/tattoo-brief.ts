export type TattooComplexity = "Low" | "Medium" | "High";

export type SizeEstimateConfidence = "Low" | "Medium" | "High";

export type RiskFlagLevel = "warning" | "danger";

export interface RiskFlag {
  level: RiskFlagLevel;
  reason: string;
}

export interface PhotoSizeEstimate {
  /** 依部位照片圈示區域估算的尺寸，如「約 8 × 12 cm」 */
  estimatedSize: string;
  confidence: SizeEstimateConfidence;
  notes: string;
}

export interface TattooBrief {
  summary: string;
  /** 任務信箱用一句話，≤60字，工作室掃讀用 */
  inboxSummary?: string;
  keyElements: string[];
  complexity: TattooComplexity;
  riskFlags: RiskFlag[];
  managerNotes: string;
  /** 有部位實拍且可辨識圈示區域時，由 AI 視覺估算 */
  photoSizeEstimate?: PhotoSizeEstimate | null;
}
