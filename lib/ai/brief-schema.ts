import { z } from "zod";

export const tattooBriefSchema = z.object({
  summary: z.string().describe("刺青需求的精簡摘要，2-3 句"),
  inboxSummary: z
    .string()
    .max(60)
    .describe(
      "任務信箱掃讀用一句話標題：部位+圖案+重點，≤60字，不可複製 summary 內容"
    ),
  keyElements: z
    .array(z.string())
    .describe("關鍵設計元素，如主題、構圖、線條風格"),
  complexity: z
    .enum(["Low", "Medium", "High"])
    .describe("預估製作複雜度"),
  riskFlags: z
    .array(
      z.object({
        level: z.enum(["warning", "danger"]),
        reason: z.string(),
      })
    )
    .describe("商業或技術風險標記"),
  managerNotes: z
    .string()
    .describe("給刺青師的內部建議與報價方向"),
  photoSizeEstimate: z
    .object({
      estimatedSize: z
        .string()
        .describe("依部位照片圈示區域估算的尺寸，如「約 8 × 12 cm」"),
      confidence: z
        .enum(["Low", "Medium", "High"])
        .describe("估算信心度，無圈示或照片不清時用 Low"),
      notes: z
        .string()
        .describe("估算依據或限制，如參考部位比例、需現場確認等"),
    })
    .nullable()
    .optional()
    .describe("無部位照片或無法辨識圈示時填 null"),
});

export type TattooBriefOutput = z.infer<typeof tattooBriefSchema>;
