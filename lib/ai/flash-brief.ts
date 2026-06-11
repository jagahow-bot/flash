import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import {
  buildFlashBriefSystemPrompt,
  buildFlashBriefUserPrompt,
  getBriefFallbackCopy,
} from "@/lib/ai/brief-prompts";
import { tattooBriefGeminiSchema } from "@/lib/ai/gemini-schema";
import { tattooBriefSchema } from "@/lib/ai/brief-schema";
import { formatIntakeSizeFromForm } from "@/lib/intake/display";
import type { IntakeForm } from "@/types/intake-form";
import type { SessionDetails } from "@/types/session-details";
import type { TattooBrief } from "@/types/tattoo-brief";
import { GoogleGenerativeAI, type Part } from "@google/generative-ai";

const FLASH_SUMMARY: Record<Locale, string> = {
  "zh-Hant": "認領圖預約",
  en: "Flash design booking",
  ja: "フラッシュデザイン予約",
  ko: "플래시 타투 예약",
  es: "Reserva de diseño flash",
  "pt-BR": "Reserva de tatuagem flash",
  de: "Flash-Design-Buchung",
  fr: "Réservation tatouage flash",
  th: "จองลายแฟลช",
};

const PLACEMENT_RISK_COPY: Record<
  Locale,
  { sensitivePlacement: string; smallArea: string }
> = {
  "zh-Hant": {
    sensitivePlacement:
      "所選部位（如手指、腳背、頸部）較難保色，建議與客戶確認設計縮放與線條粗細。",
    smallArea:
      "客戶選擇的尺寸偏小，請確認認領圖細節能否在該尺寸下清晰呈現。",
  },
  en: {
    sensitivePlacement:
      "The chosen placement (e.g. fingers, foot, neck) fades faster; confirm design scaling and line weight with the client.",
    smallArea:
      "The selected size is small; confirm the flash design details will read clearly at that scale.",
  },
  ja: {
    sensitivePlacement:
      "選択部位（指・足・首など）は色落ちしやすいため、デザインの縮尺と線の太さを確認してください。",
    smallArea:
      "選択サイズが小さいため、フラッシュの細部がそのサイズで表現できるか確認してください。",
  },
  ko: {
    sensitivePlacement:
      "선택한 부위(손가락, 발, 목 등)는 색이 빠르게 빠질 수 있으니 디자인 크기와 선 굵기를 확인하세요.",
    smallArea:
      "선택한 크기가 작아 플래시 디자인 디테일이 잘 보이는지 확인하세요.",
  },
  es: {
    sensitivePlacement:
      "La zona elegida (dedos, pie, cuello) retiene peor el color; confirma escala y grosor de línea.",
    smallArea:
      "El tamaño elegido es pequeño; confirma que los detalles del flash se lean bien a esa escala.",
  },
  "pt-BR": {
    sensitivePlacement:
      "A região escolhida (dedos, pé, pescoço) desbota mais rápido; confirme escala e espessura das linhas.",
    smallArea:
      "O tamanho escolhido é pequeno; confirme se os detalhes do flash ficam legíveis nessa escala.",
  },
  de: {
    sensitivePlacement:
      "Die gewählte Stelle (Finger, Fuß, Hals) verblasst schneller; Skalierung und Linienstärke klären.",
    smallArea:
      "Die gewählte Größe ist klein; prüfen, ob Flash-Details in diesem Maßstab lesbar sind.",
  },
  fr: {
    sensitivePlacement:
      "L'emplacement choisi (doigts, pied, cou) tient moins bien la couleur; confirmer l'échelle et l'épaisseur des traits.",
    smallArea:
      "La taille choisie est petite; vérifier que les détails du flash restent lisibles à cette échelle.",
  },
  th: {
    sensitivePlacement:
      "ตำแหน่งที่เลือก (นิ้ว เท้า คอ) สีอาจจางเร็ว ควรยืนยันสเกลลายและความหนาเส้น",
    smallArea:
      "ขนาดที่เลือกค่อนข้างเล็ก ควรยืนยันว่ารายละเอียดแฟลชยังชัดในขนาดนั้น",
  },
};

async function fetchImageInlineData(
  url: string
): Promise<{ mimeType: string; data: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    const mimeType = response.headers.get("content-type") ?? "image/jpeg";
    return {
      mimeType,
      data: Buffer.from(buffer).toString("base64"),
    };
  } catch {
    return null;
  }
}

async function buildFlashImageParts(intakeForm: IntakeForm): Promise<Part[]> {
  const parts: Part[] = [];
  const urls = [
    intakeForm.flashImageUrl,
    intakeForm.placementPhotoUrl,
  ].filter(Boolean) as string[];

  for (const url of urls) {
    const inline = await fetchImageInlineData(url);
    if (inline) {
      parts.push({ inlineData: inline });
    }
  }

  return parts;
}

function getFlashPlacementRiskFlags(
  intakeForm: IntakeForm,
  locale: Locale
): TattooBrief["riskFlags"] {
  const copy = PLACEMENT_RISK_COPY[locale];
  const placement = intakeForm.placement.toLowerCase();
  const riskFlags: TattooBrief["riskFlags"] = [];

  if (
    /指|finger|手|hand|腳|足|foot|頸|脖|neck|臉|face|耳|ear/i.test(placement)
  ) {
    riskFlags.push({
      level: "warning",
      reason: copy.sensitivePlacement,
    });
  }

  const sizeText = intakeForm.size.toLowerCase();
  if (
    /小|微|mini|tiny|3\s*cm|5\s*cm|2\s*cm|1\s*in|2\s*in/i.test(sizeText)
  ) {
    riskFlags.push({
      level: "warning",
      reason: copy.smallArea,
    });
  }

  return riskFlags;
}

export function createFlashBrief(
  intakeForm: IntakeForm,
  locale: Locale,
  managerNote?: string
): TattooBrief {
  const title = intakeForm.flashDesignTitle?.trim() || FLASH_SUMMARY[locale];
  const sizeLabel = formatIntakeSizeFromForm(intakeForm);
  const placement = intakeForm.placement?.trim() || "";

  const summary = placement
    ? `${title} — ${placement}, ${sizeLabel}`
    : `${title} — ${sizeLabel}`;

  const inboxSummary = `${title}，${placement}`.slice(0, 60);
  const riskFlags = getFlashPlacementRiskFlags(intakeForm, locale);

  return {
    summary,
    inboxSummary,
    keyElements: [title, placement, sizeLabel].filter(Boolean),
    complexity: "Low",
    riskFlags,
    managerNotes: managerNote ?? "",
    photoSizeEstimate: null,
  };
}

export function createFlashSessionDetails(totalPrice: number): SessionDetails {
  return {
    sessions: 1,
    hoursPerSession: 2,
    totalPrice,
    depositRequired: "",
  };
}

export async function generateFlashBrief(
  intakeForm: IntakeForm,
  locale: Locale = defaultLocale
): Promise<TattooBrief> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return createFlashBrief(intakeForm, locale);
  }

  const dict = await getAppDictionary(locale);
  const systemPrompt = buildFlashBriefSystemPrompt(locale);
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? "gemini-3.5-flash",
    systemInstruction: systemPrompt,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: tattooBriefGeminiSchema,
    },
  });

  const fallbackCopy = getBriefFallbackCopy(locale);

  try {
    const imageParts = await buildFlashImageParts(intakeForm);
    const result = await model.generateContent([
      { text: buildFlashBriefUserPrompt(intakeForm, dict) },
      ...imageParts,
    ]);

    const text = result.response.text();
    const parsed = tattooBriefSchema.parse(JSON.parse(text));

    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Gemini flash brief generation failed, using fallback:", message);

    if (message.includes("429") || message.includes("depleted")) {
      return createFlashBrief(
        intakeForm,
        locale,
        fallbackCopy.quotaExhausted
      );
    }

    if (message.includes("no longer available")) {
      return createFlashBrief(
        intakeForm,
        locale,
        fallbackCopy.configUpdateNeeded
      );
    }

    return createFlashBrief(
      intakeForm,
      locale,
      fallbackCopy.serviceUnavailable
    );
  }
}
