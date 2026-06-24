/**
 * One-time demo image generator for prospect studio seed data.
 *
 * Usage:
 *   npm run generate:demo-images
 *
 * Provider priority (first available wins per image):
 *   1. Gemini (GEMINI_API_KEY) — gemini-2.5-flash-image by default
 *   2. OpenAI (OPENAI_API_KEY) — DALL·E 3
 *   3. Sharp SVG fallback (no API key required)
 */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUTPUT_DIR = path.join(process.cwd(), "public", "demo", "seed");
const DEFAULT_GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";

type GeminiAspectRatio =
  | "1:1"
  | "2:3"
  | "3:2"
  | "3:4"
  | "4:3"
  | "4:5"
  | "5:4"
  | "9:16"
  | "16:9";

interface ImageSpec {
  filename: string;
  width: number;
  height: number;
  prompt: string;
  fallbackSvg: string;
}

const SPECS: ImageSpec[] = [
  {
    filename: "placement-forearm.webp",
    width: 900,
    height: 600,
    prompt:
      "Photorealistic close-up of a person's outer left forearm with fair skin, neutral studio lighting, a hand-drawn red circle marking a small tattoo placement area, no tattoo ink yet, professional medical-style reference photo for a tattoo studio booking app, clean background",
    fallbackSvg: placementSvg("Outer left forearm", "Fine-line floral zone"),
  },
  {
    filename: "placement-upper-arm.webp",
    width: 900,
    height: 600,
    prompt:
      "Photorealistic upper outer right arm skin close-up, neutral lighting, red marker circle indicating panther flash tattoo placement, no existing tattoo, professional tattoo consultation reference photo",
    fallbackSvg: placementSvg("Upper outer arm", "Panther flash placement"),
  },
  {
    filename: "placement-upper-back.webp",
    width: 900,
    height: 600,
    prompt:
      "Photorealistic upper back shoulder blade area, fair skin, red oval marking a medium tattoo placement zone for a koi design, no tattoo yet, soft studio lighting, booking reference photo",
    fallbackSvg: placementSvg("Upper back", "Koi back piece zone"),
  },
  {
    filename: "ref-floral-rose.webp",
    width: 800,
    height: 800,
    prompt:
      "Clean black fine-line tattoo flash reference sheet, single rose with delicate leaves, minimal shading, white background, professional tattoo design reference, high contrast line art",
    fallbackSvg: flashSvg("Fine-line rose", "floral"),
  },
  {
    filename: "ref-floral-leaves.webp",
    width: 800,
    height: 800,
    prompt:
      "Black fine-line botanical tattoo reference, flowing leaves and small buds, airy negative space, white background, tattoo flash line art",
    fallbackSvg: flashSvg("Botanical leaves", "floral"),
  },
  {
    filename: "ref-panther-flash.webp",
    width: 800,
    height: 800,
    prompt:
      "Neo-traditional panther head tattoo flash, bold black outlines, limited grey shading, classic American tattoo style, white background, clear reference for upper arm placement",
    fallbackSvg: flashSvg("Panther head flash", "panther"),
  },
  {
    filename: "ref-panther-detail.webp",
    width: 800,
    height: 800,
    prompt:
      "Neo-traditional crawling panther tattoo flash, dynamic pose, bold outlines, grey black shading, white background, professional tattoo reference",
    fallbackSvg: flashSvg("Crawling panther", "panther"),
  },
  {
    filename: "ref-koi-design.webp",
    width: 800,
    height: 800,
    prompt:
      "Colorful neo-traditional koi fish tattoo design reference, bold outlines, red and orange scales, white background, tattoo flash sheet style",
    fallbackSvg: flashSvg("Koi fish design", "koi"),
  },
  {
    filename: "ref-koi-waves.webp",
    width: 800,
    height: 800,
    prompt:
      "Japanese wave pattern tattoo reference, bold black lines, neo-traditional style, complements koi tattoo, white background",
    fallbackSvg: flashSvg("Wave pattern", "koi"),
  },
  {
    filename: "sketch-panther-v1.webp",
    width: 700,
    height: 700,
    prompt:
      "Pencil tattoo sketch on paper, neo-traditional panther flash layout draft, light construction lines, studio sketch scan",
    fallbackSvg: sketchSvg("Panther layout draft v1"),
  },
  {
    filename: "sketch-panther-v2.webp",
    width: 700,
    height: 700,
    prompt:
      "Refined pencil tattoo sketch, neo-traditional panther with clean outlines and shading plan, on textured paper",
    fallbackSvg: sketchSvg("Panther refined v2"),
  },
  {
    filename: "sketch-koi-line.webp",
    width: 700,
    height: 700,
    prompt:
      "Approved line-work tattoo sketch of a koi fish with waves, black ink on paper, professional tattoo studio sketch",
    fallbackSvg: sketchSvg("Koi line work"),
  },
  {
    filename: "sketch-koi-color.webp",
    width: 700,
    height: 700,
    prompt:
      "Tattoo color study sketch, koi fish with red accents and wave background, marker and pencil on paper",
    fallbackSvg: sketchSvg("Koi color study"),
  },
  {
    filename: "flash-moon.webp",
    width: 800,
    height: 800,
    prompt:
      "Fine-line crescent moon tattoo flash with tiny stars, minimal black line art, white background, ready-to-tattoo design",
    fallbackSvg: flashSvg("Fine-line moon", "moon"),
  },
  {
    filename: "flash-snake.webp",
    width: 800,
    height: 800,
    prompt:
      "Geometric snake tattoo flash, blackwork linework, symmetrical coils, white background, professional flash design",
    fallbackSvg: flashSvg("Geometric snake", "snake"),
  },
  {
    filename: "flash-rose.webp",
    width: 800,
    height: 800,
    prompt:
      "Neo-traditional rose tattoo flash, bold outlines, limited color swatches, white background, shop flash sheet",
    fallbackSvg: flashSvg("Neo-traditional rose", "rose"),
  },
  {
    filename: "healed-koi-preview.webp",
    width: 800,
    height: 1000,
    prompt:
      "Healed colorful koi tattoo on upper back, professional healed tattoo photo, natural skin tone, soft lighting, portfolio quality",
    fallbackSvg: healedSvg(),
  },
];

function placementSvg(label: string, zone: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
  <defs>
    <linearGradient id="skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e8c4a8"/>
      <stop offset="100%" stop-color="#d4a574"/>
    </linearGradient>
  </defs>
  <rect width="900" height="600" fill="#f5f0eb"/>
  <ellipse cx="450" cy="300" rx="280" ry="180" fill="url(#skin)"/>
  <ellipse cx="450" cy="300" rx="95" ry="70" fill="none" stroke="#e53935" stroke-width="4" stroke-dasharray="12 6"/>
  <text x="450" y="80" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" fill="#333">${label}</text>
  <text x="450" y="520" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" fill="#666">${zone}</text>
</svg>`;
}

function flashSvg(title: string, motif: string): string {
  const motifPath =
    motif === "floral"
      ? `<path d="M400 520 Q400 380 480 340 Q560 300 520 220 Q480 140 400 180 Q320 140 280 220 Q240 300 320 340 Q400 380 400 520 Z" fill="none" stroke="#111" stroke-width="3"/>
         <circle cx="400" cy="300" r="28" fill="none" stroke="#111" stroke-width="2.5"/>`
      : motif === "panther"
        ? `<path d="M280 420 Q320 260 420 220 Q520 180 560 280 Q600 380 500 420 Q400 460 280 420 Z" fill="none" stroke="#111" stroke-width="4"/>
           <circle cx="480" cy="290" r="12" fill="#111"/><path d="M520 250 L560 220" stroke="#111" stroke-width="3"/>`
        : motif === "koi"
          ? `<path d="M260 360 Q380 260 520 300 Q660 340 620 420 Q580 500 420 460 Q260 420 260 360 Z" fill="none" stroke="#111" stroke-width="3"/>
             <path d="M300 380 Q360 340 420 360" fill="none" stroke="#c62828" stroke-width="2"/>`
          : motif === "moon"
            ? `<path d="M420 180 A120 120 0 1 1 420 420 A90 90 0 1 0 420 180" fill="none" stroke="#111" stroke-width="3"/>`
            : motif === "snake"
              ? `<path d="M300 400 Q360 300 440 320 Q520 340 500 260 Q480 180 560 200 Q640 220 600 300 Q560 380 480 360 Q400 340 360 420 Q320 500 300 400" fill="none" stroke="#111" stroke-width="3"/>`
              : `<path d="M340 460 Q360 300 400 260 Q440 220 480 260 Q520 300 540 460 Q480 420 400 420 Q320 420 340 460 Z" fill="none" stroke="#111" stroke-width="3"/>
                 <path d="M400 260 Q430 200 460 240" fill="none" stroke="#111" stroke-width="2"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="#fff"/>
  <rect x="40" y="40" width="720" height="720" fill="none" stroke="#ddd" stroke-width="2"/>
  ${motifPath}
  <text x="400" y="720" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" fill="#444">${title}</text>
</svg>`;
}

function sketchSvg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="700" viewBox="0 0 700 700">
  <rect width="700" height="700" fill="#f2e8d5"/>
  <rect x="50" y="50" width="600" height="600" fill="#faf6ef" stroke="#d8cbb8" stroke-width="2"/>
  <path d="M180 480 Q260 280 350 250 Q440 220 520 320 Q560 380 500 440 Q420 500 300 460 Q220 430 180 480" fill="none" stroke="#555" stroke-width="2" opacity="0.8"/>
  <path d="M220 420 Q300 360 380 380 Q460 400 480 340" fill="none" stroke="#888" stroke-width="1.5" stroke-dasharray="6 4"/>
  <text x="350" y="620" text-anchor="middle" font-family="Georgia,serif" font-size="20" fill="#666" font-style="italic">${title}</text>
</svg>`;
}

function healedSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <rect width="800" height="1000" fill="#efe6dc"/>
  <ellipse cx="400" cy="480" rx="220" ry="300" fill="#e0b896"/>
  <path d="M260 520 Q340 380 420 400 Q500 420 540 500 Q580 580 480 620 Q380 660 300 600 Q240 560 260 520 Z" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <path d="M320 480 Q380 440 440 460 Q500 480 520 520" fill="none" stroke="#c62828" stroke-width="2"/>
  <text x="400" y="920" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" fill="#555">Healed koi — session 1 preview</text>
</svg>`;
}

function hasGeminiKey(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim();
  return Boolean(key && key !== "your_gemini_api_key_here");
}

function hasOpenAiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function geminiAspectRatio(width: number, height: number): GeminiAspectRatio {
  const ratio = width / height;
  if (ratio > 1.5) return "16:9";
  if (ratio > 1.2) return "3:2";
  if (ratio > 0.85) return "1:1";
  if (ratio > 0.7) return "4:5";
  return "9:16";
}

function openAiSize(width: number, height: number): "1024x1024" | "1792x1024" | "1024x1792" {
  if (width > height * 1.2) return "1792x1024";
  if (height > width * 1.2) return "1024x1792";
  return "1024x1024";
}

function extractGeminiImageBuffer(json: {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: { data?: string };
        inline_data?: { data?: string };
      }>;
    };
  }>;
}): Buffer | null {
  for (const part of json.candidates?.[0]?.content?.parts ?? []) {
    const data = part.inlineData?.data ?? part.inline_data?.data;
    if (data) return Buffer.from(data, "base64");
  }
  return null;
}

async function generateWithGemini(
  prompt: string,
  width: number,
  height: number,
): Promise<Buffer | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === "your_gemini_api_key_here") return null;

  const model = process.env.GEMINI_IMAGE_MODEL?.trim() || DEFAULT_GEMINI_IMAGE_MODEL;
  const aspectRatio = geminiAspectRatio(width, height);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          imageConfig: { aspectRatio },
        },
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    console.warn(`Gemini image failed (${response.status}): ${text.slice(0, 300)}`);
    return null;
  }

  const json = (await response.json()) as Parameters<typeof extractGeminiImageBuffer>[0];
  return extractGeminiImageBuffer(json);
}

async function generateWithOpenAi(
  prompt: string,
  size: "1024x1024" | "1792x1024" | "1024x1792",
): Promise<Buffer | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size,
      response_format: "b64_json",
      quality: "standard",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.warn(`OpenAI image failed (${response.status}): ${text.slice(0, 200)}`);
    return null;
  }

  const json = (await response.json()) as {
    data?: Array<{ b64_json?: string }>;
  };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) return null;
  return Buffer.from(b64, "base64");
}

async function writeWebp(spec: ImageSpec, source: Buffer): Promise<void> {
  const outPath = path.join(OUTPUT_DIR, spec.filename);
  await sharp(source)
    .resize(spec.width, spec.height, { fit: "cover" })
    .webp({ quality: 85 })
    .toFile(outPath);
}

async function renderFallback(spec: ImageSpec): Promise<Buffer> {
  return sharp(Buffer.from(spec.fallbackSvg)).png().toBuffer();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const useGemini = hasGeminiKey();
  const useOpenAi = hasOpenAiKey();
  const geminiModel = process.env.GEMINI_IMAGE_MODEL?.trim() || DEFAULT_GEMINI_IMAGE_MODEL;

  if (useGemini) {
    console.log(`Generating demo images with Gemini (${geminiModel})…`);
  } else if (useOpenAi) {
    console.log("Generating demo images with OpenAI (DALL·E 3)…");
  } else {
    console.log(
      "No GEMINI_API_KEY or OPENAI_API_KEY — using Sharp SVG fallback renders…",
    );
  }

  let geminiCount = 0;
  let openAiCount = 0;
  let fallbackCount = 0;

  for (const spec of SPECS) {
    let buffer: Buffer | null = null;
    let source: "gemini" | "openai" | "fallback" = "fallback";

    if (useGemini) {
      try {
        buffer = await generateWithGemini(spec.prompt, spec.width, spec.height);
        if (buffer) source = "gemini";
      } catch (error) {
        console.warn(`  Gemini error for ${spec.filename}:`, error);
      }
      await sleep(1500);
    }

    if (!buffer && useOpenAi) {
      try {
        buffer = await generateWithOpenAi(spec.prompt, openAiSize(spec.width, spec.height));
        if (buffer) source = "openai";
      } catch (error) {
        console.warn(`  OpenAI error for ${spec.filename}:`, error);
      }
    }

    if (!buffer) {
      buffer = await renderFallback(spec);
      source = "fallback";
    }

    await writeWebp(spec, buffer);

    if (source === "gemini") geminiCount += 1;
    else if (source === "openai") openAiCount += 1;
    else fallbackCount += 1;

    const tag =
      source === "gemini" ? "gemini" : source === "openai" ? "openai" : "svg fallback";
    console.log(`  ✓ ${spec.filename} (${tag})`);
  }

  console.log(`\nDone — ${SPECS.length} images in public/demo/seed/`);
  if (useGemini) {
    console.log(`  Gemini: ${geminiCount}, OpenAI: ${openAiCount}, fallback: ${fallbackCount}`);
  } else if (useOpenAi) {
    console.log(`  OpenAI: ${openAiCount}, fallback: ${fallbackCount}`);
  } else {
    console.log(
      "\nTip: set GEMINI_API_KEY in .env.local and re-run:\n  npm run generate:demo-images",
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
