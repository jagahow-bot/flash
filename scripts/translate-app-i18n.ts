/**
 * One-time script: translate app i18n from zh-Hant to all other locales via Gemini.
 *
 * Usage: npx tsx --env-file=.env.local scripts/translate-app-i18n.ts
 *        npx tsx --env-file=.env.local scripts/translate-app-i18n.ts --locale en
 */
import fs from "node:fs/promises";
import path from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { locales, type Locale } from "../lib/i18n/config";
import sourceDict from "../lib/i18n/dictionaries/app/zh-Hant";

const TARGET_LOCALES: Locale[] = locales.filter((l) => l !== "zh-Hant");

const LOCALE_NAMES: Record<Locale, string> = {
  "zh-Hant": "Traditional Chinese",
  en: "English",
  ja: "Japanese",
  ko: "Korean",
  es: "Spanish",
  "pt-BR": "Brazilian Portuguese",
  de: "German",
  fr: "French",
  th: "Thai",
};

const LOCALE_INSTRUCTIONS: Partial<Record<Locale, string>> = {
  en: "Use natural, conversational English suitable for a tattoo studio booking product.",
  ja: "Use polite です・ます style suitable for customer-facing services.",
  ko: "Use polite 해요체 suitable for customer-facing services.",
  "pt-BR": "Use Brazilian Portuguese (pt-BR), not European Portuguese.",
  th: "Use polite Thai suitable for customer-facing services.",
};

async function translateDictionary(
  targetLocale: Locale,
  apiKey: string,
  model: string,
): Promise<object> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const generativeModel = genAI.getGenerativeModel({
    model,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const sourceJson = JSON.stringify(
    { ...sourceDict, locale: targetLocale },
    null,
    2,
  );

  const prompt = `You are translating UI copy for FLASH, a tattoo studio booking SaaS.

Source language: Traditional Chinese (zh-Hant)
Target language: ${LOCALE_NAMES[targetLocale]} (${targetLocale})
${LOCALE_INSTRUCTIONS[targetLocale] ?? "Use natural, customer-facing language."}

Rules:
1. Return ONLY valid JSON matching the exact structure of the source.
2. Set "locale" to "${targetLocale}".
3. Keep placeholders like {count}, {index}, {total}, {deadline}, {version} unchanged.
4. Keep "FLASH" and "Email" as-is unless the target locale normally transliterates them.
5. For booking.stylePresets and booking.genderOptions, translate VALUES but keep object KEYS exactly as in source (Chinese keys are stored in the database).
6. For dashboard.weekdayShort, return exactly 7 short weekday labels starting Sunday.
7. Do NOT add dev/debug language. Tone: helpful, clear, customer-facing.
8. Remove any technical jargon.

Source JSON:
${sourceJson}`;

  const result = await generativeModel.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text) as object;
}

function toTsModule(dict: object, locale: Locale): string {
  return `const dictionary = ${JSON.stringify(dict, null, 2)};

export default dictionary;
`;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is required. Set it in .env.local");
    process.exit(1);
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const argLocale = process.argv.find((a) => a.startsWith("--locale="))?.split("=")[1]
    ?? (process.argv.includes("--locale")
      ? process.argv[process.argv.indexOf("--locale") + 1]
      : undefined);

  const targets = argLocale
    ? TARGET_LOCALES.filter((l) => l === argLocale)
    : TARGET_LOCALES;

  if (targets.length === 0) {
    console.error(`Unknown locale: ${argLocale}`);
    process.exit(1);
  }

  const outDir = path.join(process.cwd(), "lib/i18n/dictionaries/app");

  for (const locale of targets) {
    console.log(`Translating to ${locale}...`);
    const translated = await translateDictionary(locale, apiKey, model);
    const filePath = path.join(outDir, `${locale}.ts`);
    await fs.writeFile(filePath, toTsModule(translated, locale), "utf8");
    console.log(`Wrote ${filePath}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
