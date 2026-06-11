import type { Locale } from "@/lib/i18n/config";
import type { AppDictionary } from "@/lib/i18n/app-types";
import {
  formatIntakeBudgetFromForm,
  formatIntakeColorMode,
  formatIntakeSizeFromForm,
} from "@/lib/intake/display";
import { formatPhoneDisplay } from "@/lib/phone/format";
import type { IntakeForm } from "@/types/intake-form";
import type { TattooBrief } from "@/types/tattoo-brief";

const OUTPUT_LANGUAGE: Record<Locale, string> = {
  "zh-Hant": "Traditional Chinese (繁體中文)",
  en: "English",
  ja: "Japanese (日本語)",
  ko: "Korean (한국어)",
  es: "Spanish (Español)",
  "pt-BR": "Brazilian Portuguese (Português do Brasil)",
  de: "German (Deutsch)",
  fr: "French (Français)",
  th: "Thai (ไทย)",
};

export function buildBriefSystemPrompt(locale: Locale): string {
  const language = OUTPUT_LANGUAGE[locale];

  return `You are the FLASH intake assistant for a tattoo studio. Turn client intake data into a structured brief and flag business or technical risks.

Respond with JSON only. Fields: summary, inboxSummary, keyElements, complexity (Low/Medium/High), riskFlags, managerNotes, photoSizeEstimate.

Language rule (critical): Every user-facing string MUST be written in ${language} — summary, inboxSummary, each keyElements item, each riskFlags.reason, and managerNotes when non-empty. complexity levels stay Low/Medium/High in English.

summary: 2-3 complete sentences.
inboxSummary: One scannable inbox headline (placement + motif + key point), max ~60 characters, written independently — do not copy or truncate summary. Example (zh-Hant): 「腳背細線皮卡丘曬太陽，客戶要簡約線條」.

riskFlags: Each item has reason (in ${language}) and level (warning or danger).

managerNotes: Only when the studio manager must be alerted. Use ${language}. Never mention APIs or technical details.

photoSizeEstimate: Analyze the placement photo when provided; otherwise null.`;
}

export function buildFlashBriefSystemPrompt(locale: Locale): string {
  const language = OUTPUT_LANGUAGE[locale];

  return `You are the FLASH intake assistant for a tattoo studio. A client booked a pre-designed flash tattoo (認領圖). Turn the flash booking data into a structured brief for the artist.

Respond with JSON only. Fields: summary, inboxSummary, keyElements, complexity (Low/Medium/High), riskFlags, managerNotes, photoSizeEstimate.

Language rule (critical): Every user-facing string MUST be written in ${language} — summary, inboxSummary, each keyElements item, each riskFlags.reason, and managerNotes when non-empty. complexity levels stay Low/Medium/High in English.

Flash booking defaults:
- complexity is usually Low (pre-designed, fixed artwork) unless the chosen size/placement makes execution harder.
- isCoverUp is always false for flash; do not flag cover-up risks.

summary: 2-3 sentences describing the flash design title, visual elements (from the flash image if attached), client placement, and selected size.
inboxSummary: One scannable inbox headline (flash title + placement + size), max ~60 characters, written independently — do not copy summary.
keyElements: Include flash design title, notable visual motifs from the design image, placement, and size.

riskFlags: Flag placement or sizing issues only when relevant — e.g. very detailed flash on fingers/hands, design may not fit chosen placement, high-movement areas needing extra care. Each item has reason (in ${language}) and level (warning or danger).

managerNotes: Brief artist-facing note when helpful (e.g. confirm placement fits design proportions). Use ${language}. Leave empty if nothing special.

photoSizeEstimate: Analyze the placement photo when provided and compare to the selected flash size; otherwise null.`;
}

export function buildFlashBriefUserPrompt(
  intakeForm: IntakeForm,
  dict: AppDictionary
): string {
  const notProvided = localeNotProvidedLabel(dict.locale);
  const none = localeNoneLabel(dict.locale);
  const price =
    typeof intakeForm.flashPrice === "number"
      ? String(intakeForm.flashPrice)
      : notProvided;

  return `Generate a brief for this flash design booking:

- Booking type: Flash design (pre-designed artwork, not custom)
- Flash design title: ${intakeForm.flashDesignTitle || notProvided}
- Listed price: ${price}
- Client placement: ${intakeForm.placement}
- Client selected size: ${formatIntakeSizeFromForm(intakeForm)}
- Color mode: ${formatIntakeColorMode(intakeForm.colorMode, dict) || notProvided}
- Availability: ${intakeForm.availability.join(", ")}
- Client notes: ${intakeForm.notes || none}
- Name: ${intakeForm.socialContacts?.clientName || notProvided}
- Phone: ${
    formatPhoneDisplay(
      intakeForm.socialContacts?.phoneCountryCode,
      intakeForm.socialContacts?.phone
    ) || notProvided
  }
- Flash design image: ${intakeForm.flashImageUrl ? "Provided (see attached; describe visible motifs and style)" : "Not provided"}
- Placement photo: ${intakeForm.placementPhotoUrl ? "Provided (see attached; analyze marked area and compare to selected flash size)" : "Not provided (set photoSizeEstimate to null unless placement photo attached)"}`;
}

export function buildBriefUserPrompt(
  intakeForm: IntakeForm,
  dict: AppDictionary
): string {
  const yes = "Yes";
  const no = "No";
  const notProvided = localeNotProvidedLabel(dict.locale);
  const none = localeNoneLabel(dict.locale);

  return `Generate a brief from this client intake form:

- Placement: ${intakeForm.placement}
- Client size: ${formatIntakeSizeFromForm(intakeForm)}
- Style: ${intakeForm.style}
- Color mode: ${formatIntakeColorMode(intakeForm.colorMode, dict) || notProvided}
- Cover-up: ${intakeForm.isCoverUp ? yes : no}
- Budget: ${formatIntakeBudgetFromForm(intakeForm) || notProvided}
- Availability: ${intakeForm.availability.join(", ")}
- Description: ${intakeForm.description}
- Notes: ${intakeForm.notes || none}
- Name: ${intakeForm.socialContacts?.clientName || notProvided}
- Gender: ${intakeForm.socialContacts?.gender || notProvided}
- Phone: ${
    formatPhoneDisplay(
      intakeForm.socialContacts?.phoneCountryCode,
      intakeForm.socialContacts?.phone
    ) || notProvided
  }
- Instagram: ${intakeForm.socialContacts?.instagram || notProvided}
- Facebook: ${intakeForm.socialContacts?.facebook || notProvided}
- WhatsApp: ${intakeForm.socialContacts?.whatsapp || notProvided}
- LINE: ${intakeForm.socialContacts?.line || notProvided}
- Threads: ${intakeForm.socialContacts?.threads || notProvided}
- Placement photo: ${intakeForm.placementPhotoUrl ? "Provided (see attached image; analyze marked area and estimate size)" : "Not provided (set photoSizeEstimate to null)"}
- Reference images: ${intakeForm.referenceUrls?.length ?? 0}`;
}

function localeNotProvidedLabel(locale: Locale): string {
  const labels: Record<Locale, string> = {
    "zh-Hant": "未提供",
    en: "Not provided",
    ja: "未記入",
    ko: "미제공",
    es: "No proporcionado",
    "pt-BR": "Não informado",
    de: "Nicht angegeben",
    fr: "Non renseigné",
    th: "ไม่ได้ระบุ",
  };
  return labels[locale];
}

function localeNoneLabel(locale: Locale): string {
  const labels: Record<Locale, string> = {
    "zh-Hant": "無",
    en: "None",
    ja: "なし",
    ko: "없음",
    es: "Ninguno",
    "pt-BR": "Nenhum",
    de: "Keine",
    fr: "Aucun",
    th: "ไม่มี",
  };
  return labels[locale];
}

interface BriefFallbackCopy {
  smallCoverUpDanger: string;
  coverUpWarning: string;
  quotaExhausted: string;
  configUpdateNeeded: string;
  serviceUnavailable: string;
}

const FALLBACK_COPY: Record<Locale, BriefFallbackCopy> = {
  "zh-Hant": {
    smallCoverUpDanger:
      "小圖蓋圖技術難度高，建議與客戶確認是否願意放大或分次進行。",
    coverUpWarning: "蓋圖需求需預留額外諮詢與修改次數。",
    quotaExhausted: "AI 摘要服務額度已用完，目前先以基本摘要呈現。",
    configUpdateNeeded: "AI 摘要服務設定需更新，目前先以基本摘要呈現。",
    serviceUnavailable: "AI 摘要服務暫時無法使用，目前先以基本摘要呈現。",
  },
  en: {
    smallCoverUpDanger:
      "Small cover-ups are technically demanding; confirm whether the client is open to enlarging the design or multiple sessions.",
    coverUpWarning:
      "Cover-up requests need extra consultation and revision time.",
    quotaExhausted:
      "AI summary quota is exhausted; showing a basic summary for now.",
    configUpdateNeeded:
      "AI summary service needs a configuration update; showing a basic summary for now.",
    serviceUnavailable:
      "AI summary is temporarily unavailable; showing a basic summary for now.",
  },
  ja: {
    smallCoverUpDanger:
      "小さなカバーアップは技術的に難易度が高いため、デザインを大きくするか複数回に分けるかを確認してください。",
    coverUpWarning:
      "カバーアップは追加の相談と修正回数が必要になる可能性があります。",
    quotaExhausted:
      "AI要約の利用枠が不足しているため、基本要約を表示しています。",
    configUpdateNeeded:
      "AI要約の設定更新が必要なため、基本要約を表示しています。",
    serviceUnavailable:
      "AI要約を一時的に利用できないため、基本要約を表示しています。",
  },
  ko: {
    smallCoverUpDanger:
      "작은 커버업은 기술적으로 어려우니 디자인 확대나 분할 시술 가능 여부를 확인하세요.",
    coverUpWarning: "커버업은 추가 상담과 수정 시간이 필요할 수 있습니다.",
    quotaExhausted:
      "AI 요약 할당량이 소진되어 기본 요약을 표시합니다.",
    configUpdateNeeded:
      "AI 요약 설정 업데이트가 필요하여 기본 요약을 표시합니다.",
    serviceUnavailable:
      "AI 요약을 일시적으로 사용할 수 없어 기본 요약을 표시합니다.",
  },
  es: {
    smallCoverUpDanger:
      "Los cover-ups pequeños son técnicamente exigentes; confirma si el cliente acepta ampliar el diseño o varias sesiones.",
    coverUpWarning:
      "Los cover-ups requieren consultas y revisiones adicionales.",
    quotaExhausted:
      "La cuota del resumen con IA se agotó; se muestra un resumen básico.",
    configUpdateNeeded:
      "El servicio de resumen con IA necesita actualización; se muestra un resumen básico.",
    serviceUnavailable:
      "El resumen con IA no está disponible temporalmente; se muestra un resumen básico.",
  },
  "pt-BR": {
    smallCoverUpDanger:
      "Cover-ups pequenos são tecnicamente difíceis; confirme se o cliente aceita ampliar o desenho ou várias sessões.",
    coverUpWarning:
      "Cover-ups exigem consultas e revisões adicionais.",
    quotaExhausted:
      "A cota do resumo com IA acabou; exibindo um resumo básico.",
    configUpdateNeeded:
      "O serviço de resumo com IA precisa de atualização; exibindo um resumo básico.",
    serviceUnavailable:
      "O resumo com IA está temporariamente indisponível; exibindo um resumo básico.",
  },
  de: {
    smallCoverUpDanger:
      "Kleine Cover-ups sind technisch anspruchsvoll; klären Sie, ob der Kunde eine Vergrößerung oder mehrere Sitzungen akzeptiert.",
    coverUpWarning:
      "Cover-ups erfordern zusätzliche Beratung und Korrekturzeit.",
    quotaExhausted:
      "Das KI-Zusammenfassungskontingent ist aufgebraucht; es wird eine Basiszusammenfassung angezeigt.",
    configUpdateNeeded:
      "Der KI-Zusammenfassungsdienst benötigt eine Konfigurationsaktualisierung; es wird eine Basiszusammenfassung angezeigt.",
    serviceUnavailable:
      "Die KI-Zusammenfassung ist vorübergehend nicht verfügbar; es wird eine Basiszusammenfassung angezeigt.",
  },
  fr: {
    smallCoverUpDanger:
      "Les cover-ups de petite taille sont techniquement exigeants; confirmez si le client accepte d'agrandir le motif ou plusieurs séances.",
    coverUpWarning:
      "Les cover-ups nécessitent des consultations et révisions supplémentaires.",
    quotaExhausted:
      "Le quota de résumé IA est épuisé; affichage d'un résumé de base.",
    configUpdateNeeded:
      "Le service de résumé IA nécessite une mise à jour; affichage d'un résumé de base.",
    serviceUnavailable:
      "Le résumé IA est temporairement indisponible; affichage d'un résumé de base.",
  },
  th: {
    smallCoverUpDanger:
      "การ cover-up ขนาดเล็่มีความยากทางเทคนิค ควรยืนยันว่าลูกค้ายอมขยายลายหรือแบ่งหลายครั้งหรือไม่",
    coverUpWarning: "งาน cover-up ต้องใช้เวลาปรึกษาและแก้ไขเพิ่มเติม",
    quotaExhausted:
      "โควต้าสรุป AI หมดแล้ว แสดงสรุปพื้นฐานชั่วคราว",
    configUpdateNeeded:
      "บริการสรุป AI ต้องอัปเดตการตั้งค่า แสดงสรุปพื้นฐานชั่วคราว",
    serviceUnavailable:
      "บริการสรุป AI ใช้งานไม่ได้ชั่วคราว แสดงสรุปพื้นฐานชั่วคราว",
  },
};

export function getBriefFallbackCopy(locale: Locale): BriefFallbackCopy {
  return FALLBACK_COPY[locale];
}

export function createFallbackBrief(
  intakeForm: IntakeForm,
  locale: Locale,
  managerNote?: string
): TattooBrief {
  const copy = getBriefFallbackCopy(locale);
  const riskFlags: TattooBrief["riskFlags"] = [];

  if (intakeForm.isCoverUp) {
    const isSmallCoverUp =
      /小|微|mini|coin|3\s*cm|5\s*cm|公分以下/i.test(intakeForm.size);
    riskFlags.push({
      level: isSmallCoverUp ? "danger" : "warning",
      reason: isSmallCoverUp ? copy.smallCoverUpDanger : copy.coverUpWarning,
    });
  }

  const inboxSummary = `${intakeForm.placement}${intakeForm.style}，${intakeForm.description.trim().slice(0, 24)}`;

  return {
    summary: `${intakeForm.placement} — ${intakeForm.style}, size ~ ${formatIntakeSizeFromForm(intakeForm)}.`,
    inboxSummary: inboxSummary.slice(0, 60),
    keyElements: [intakeForm.style, intakeForm.placement],
    complexity: intakeForm.isCoverUp ? "Medium" : "Low",
    riskFlags,
    managerNotes: managerNote ?? "",
    photoSizeEstimate: null,
  };
}
