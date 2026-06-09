import { SchemaType, type ObjectSchema } from "@google/generative-ai";

export const tattooBriefGeminiSchema: ObjectSchema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: {
      type: SchemaType.STRING,
      description: "刺青需求的精簡摘要，2-3 句，繁體中文",
    },
    inboxSummary: {
      type: SchemaType.STRING,
      description:
        "任務信箱掃讀用一句話標題（部位+圖案+重點），≤60字繁體中文，須獨立撰寫、不可複製 summary",
    },
    keyElements: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "關鍵設計元素",
    },
    complexity: {
      type: SchemaType.STRING,
      format: "enum",
      enum: ["Low", "Medium", "High"],
    },
    riskFlags: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          level: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["warning", "danger"],
          },
          reason: { type: SchemaType.STRING },
        },
        required: ["level", "reason"],
      },
    },
    managerNotes: {
      type: SchemaType.STRING,
      description: "給刺青師的內部建議，繁體中文",
    },
    photoSizeEstimate: {
      type: SchemaType.OBJECT,
      nullable: true,
      description:
        "依部位實拍圈示區域估算尺寸；無照片或無法辨識圈示時為 null",
      properties: {
        estimatedSize: {
          type: SchemaType.STRING,
          description: "如「約 8 × 12 cm」",
        },
        confidence: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["Low", "Medium", "High"],
        },
        notes: {
          type: SchemaType.STRING,
          description: "估算依據與限制說明",
        },
      },
      required: ["estimatedSize", "confidence", "notes"],
    },
  },
  required: [
    "summary",
    "inboxSummary",
    "keyElements",
    "complexity",
    "riskFlags",
    "managerNotes",
    "photoSizeEstimate",
  ],
};
