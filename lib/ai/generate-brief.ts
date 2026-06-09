import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import {
  buildBriefSystemPrompt,
  buildBriefUserPrompt,
  createFallbackBrief,
  getBriefFallbackCopy,
} from "@/lib/ai/brief-prompts";
import type { IntakeForm } from "@/types/intake-form";
import type { TattooBrief } from "@/types/tattoo-brief";
import { tattooBriefGeminiSchema } from "@/lib/ai/gemini-schema";
import { tattooBriefSchema } from "@/lib/ai/brief-schema";
import { GoogleGenerativeAI, type Part } from "@google/generative-ai";

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

async function buildImageParts(intakeForm: IntakeForm): Promise<Part[]> {
  const parts: Part[] = [];
  const urls = [
    intakeForm.placementPhotoUrl,
    ...(intakeForm.referenceUrls ?? []),
  ].filter(Boolean) as string[];

  for (const url of urls) {
    const inline = await fetchImageInlineData(url);
    if (inline) {
      parts.push({ inlineData: inline });
    }
  }

  return parts;
}

export async function generateTattooBrief(
  intakeForm: IntakeForm,
  locale: Locale = defaultLocale
): Promise<TattooBrief> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return createFallbackBrief(intakeForm, locale);
  }

  const dict = await getAppDictionary(locale);
  const systemPrompt = buildBriefSystemPrompt(locale);
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
    const imageParts = await buildImageParts(intakeForm);
    const result = await model.generateContent([
      { text: buildBriefUserPrompt(intakeForm, dict) },
      ...imageParts,
    ]);

    const text = result.response.text();
    const parsed = tattooBriefSchema.parse(JSON.parse(text));

    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Gemini brief generation failed, using fallback:", message);

    if (message.includes("429") || message.includes("depleted")) {
      return createFallbackBrief(
        intakeForm,
        locale,
        fallbackCopy.quotaExhausted
      );
    }

    if (message.includes("no longer available")) {
      return createFallbackBrief(
        intakeForm,
        locale,
        fallbackCopy.configUpdateNeeded
      );
    }

    return createFallbackBrief(
      intakeForm,
      locale,
      fallbackCopy.serviceUnavailable
    );
  }
}
