import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { studioProfileGeminiSchema } from "@/lib/ai/studio-profile-gemini-schema";

export interface StudioRawBundle {
  googleMaps?: {
    name?: string;
    formattedAddress?: string;
    phone?: string;
    website?: string;
    openingHours?: string[];
    rating?: number;
  };
  website?: {
    pages?: Array<{ url?: string; text?: string; source?: string }>;
  };
  social?: {
    instagram?: { handle?: string; bio?: string; captions?: string[] };
    facebook?: { url?: string; about?: string };
  };
  scrapedContact?: {
    email?: string;
    instagram?: string;
    facebook?: string;
    line?: string;
    website?: string;
    phone?: string;
    address?: string;
  };
  notes?: string;
  htmlSnapshotDir?: string;
}

const extractedProfileSchema = z.object({
  name: z.string().max(120).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  artistNames: z.array(z.string().min(1).max(80)).max(20).default([]),
  isSoloStudio: z.boolean().optional().nullable(),
  acceptsCoverUp: z.boolean().optional().nullable(),
  instagram: z.string().max(200).optional().nullable(),
  facebook: z.string().max(500).optional().nullable(),
  line: z.string().max(200).optional().nullable(),
  threads: z.string().max(200).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  flashImageUrls: z.array(z.string().url()).max(12).optional().nullable(),
  extractionNotes: z.string().max(1000).optional().nullable(),
});

export type ExtractedStudioProfile = z.infer<typeof extractedProfileSchema>;

const SYSTEM_PROMPT = `You extract structured tattoo studio profile data from scraped public sources.

The raw bundle may include:
- googleMaps listing fields
- website.pages[]: visible text extracted from saved HTML snapshots (multiple pages/sources)
- social.facebook.about / social.instagram.bio: text from Facebook or Instagram HTML
- htmlSnapshotDir: reference path only (ignore as data)

Rules:
- Only use facts present in the provided raw bundle. Never invent payment info, bank details, or prices.
- If a field is unknown, use null (strings) or an empty array (artistNames).
- artistNames: list every tattoo artist name mentioned (team page, IG bio, "our artists", etc.). Use display names only.
- isSoloStudio: true when clearly a single artist; false when multiple artists are named; null if unclear.
- bio: concise public-facing studio description in the same language as the primary source text.
- flashImageUrls: only include direct image URLs that look like flash / walk-in designs from the sources (not icons).
- Do not include email in the output JSON (it is handled separately).
- extractionNotes: mention any important uncertainty in one short sentence.`;

function bundleToPromptText(rawBundle: StudioRawBundle): string {
  return JSON.stringify(rawBundle, null, 2);
}

function normalizeProfile(
  parsed: ExtractedStudioProfile,
): ExtractedStudioProfile {
  const artistNames = [
    ...new Set(
      (parsed.artistNames ?? [])
        .map((name) => name.trim())
        .filter((name) => name.length > 0),
    ),
  ].slice(0, 20);

  return {
    ...parsed,
    name: parsed.name?.trim() || undefined,
    bio: parsed.bio?.trim() || undefined,
    artistNames,
    instagram: parsed.instagram?.replace(/^@+/, "").trim() || undefined,
    threads: parsed.threads?.replace(/^@+/, "").trim() || undefined,
    flashImageUrls: parsed.flashImageUrls?.slice(0, 12),
  };
}

export async function extractStudioProfileFromRawBundle(
  rawBundle: StudioRawBundle,
): Promise<ExtractedStudioProfile> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return normalizeProfile({
      artistNames: [],
      extractionNotes: "GEMINI_API_KEY not configured — skipped AI extraction.",
    });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: studioProfileGeminiSchema,
    },
  });

  const result = await model.generateContent([
    {
      text: `Extract studio profile from this raw scrape bundle:\n\n${bundleToPromptText(rawBundle)}`,
    },
  ]);

  const text = result.response.text();
  const json = JSON.parse(text) as unknown;
  const parsed = extractedProfileSchema.parse(json);
  return normalizeProfile(parsed);
}
