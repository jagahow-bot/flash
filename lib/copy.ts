import type { AppDictionary } from "@/lib/i18n/app-types";
import type { UserRole } from "@/types/user";
import type {
  SizeEstimateConfidence,
  TattooComplexity,
} from "@/types/tattoo-brief";

export function getRoleLabel(role: UserRole, dict: AppDictionary): string {
  return dict.roles[role] ?? role;
}

export function getComplexityLabel(
  complexity: TattooComplexity,
  dict: AppDictionary,
): string {
  return dict.complexity[complexity] ?? complexity;
}

export function getConfidenceLabel(
  confidence: SizeEstimateConfidence,
  dict: AppDictionary,
): string {
  return dict.confidence[confidence] ?? confidence;
}

/** 過濾僅供內部除錯的店長備註，避免顯示在工作室後台 */
export function sanitizeManagerNotes(notes?: string): string | undefined {
  if (!notes?.trim()) return undefined;

  const trimmed = notes.trim();
  if (
    /fallback|GEMINI|開發模式|環境變數|API 額度|dev mode|debug/i.test(trimmed)
  ) {
    return undefined;
  }

  return trimmed;
}
