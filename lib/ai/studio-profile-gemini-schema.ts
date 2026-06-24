import { SchemaType, type ObjectSchema } from "@google/generative-ai";

export const studioProfileGeminiSchema: ObjectSchema = {
  type: SchemaType.OBJECT,
  properties: {
    name: {
      type: SchemaType.STRING,
      nullable: true,
      description: "Studio display name",
    },
    bio: {
      type: SchemaType.STRING,
      nullable: true,
      description: "Public studio bio, max 2000 chars, no payment info",
    },
    artistNames: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description:
        "Individual tattoo artist names working at this studio (display names only)",
    },
    isSoloStudio: {
      type: SchemaType.BOOLEAN,
      nullable: true,
      description: "True if only one artist / solo practitioner",
    },
    acceptsCoverUp: {
      type: SchemaType.BOOLEAN,
      nullable: true,
      description: "True only if explicitly stated; null if unknown",
    },
    instagram: {
      type: SchemaType.STRING,
      nullable: true,
      description: "Instagram handle without @",
    },
    facebook: {
      type: SchemaType.STRING,
      nullable: true,
      description: "Facebook page URL or slug",
    },
    line: {
      type: SchemaType.STRING,
      nullable: true,
      description: "LINE ID or official link",
    },
    threads: {
      type: SchemaType.STRING,
      nullable: true,
      description: "Threads handle without @",
    },
    logoUrl: {
      type: SchemaType.STRING,
      nullable: true,
      description: "Direct URL to logo or profile image if found in sources",
    },
    flashImageUrls: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      nullable: true,
      description: "URLs of flash / walk-in tattoo design images (max 12)",
    },
    extractionNotes: {
      type: SchemaType.STRING,
      nullable: true,
      description: "Brief notes on confidence gaps or missing data",
    },
  },
};
