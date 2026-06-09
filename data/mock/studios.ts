import type { Studio } from "@/types/studio";
import { MOCK_ARTIST_IDS, MOCK_STUDIO_ID } from "@/data/mock/ids";

export const mockStudio: Studio = {
  studioId: MOCK_STUDIO_ID,
  slug: "mohen-tattoo",
  bookingCode: "MOHEN",
  name: "墨痕工作室",
  bio: "專注細線、寫實與日式傳統風格，提供客製化刺青諮詢與完整術後照護指引。",
  paymentInfo:
    "銀行：台灣銀行 (004)\n戶名：墨痕工作室\n帳號：1234-5678-9012\n請於備註填寫預約編號，完成後上傳轉帳截圖。",
  depositDeadlineDays: 3,
  acceptsCoverUp: true,
  artists: [MOCK_ARTIST_IDS.main, MOCK_ARTIST_IDS.second],
  careGuide:
    "1. 完成後以保養膜覆蓋 2-4 小時\n2. 以溫和肥皂清洗，避免搓揉\n3. 薄擦凡士林，每日 2-3 次\n4. 兩週內避免游泳、三溫暖與強烈日曬",
  weeklySchedule: {
    mon: { closed: false, start: "13:00", end: "22:00" },
    tue: { closed: false, start: "13:00", end: "22:00" },
    wed: { closed: false, start: "13:00", end: "18:00" },
    thu: { closed: false, start: "13:00", end: "22:00" },
    fri: { closed: false, start: "13:00", end: "22:00" },
    sat: { closed: false, start: "13:00", end: "22:00" },
    sun: { closed: false, start: "13:00", end: "18:00" },
  },
  closures: [],
  operatingHours: {
    mon: [13, 14, 15, 16, 17, 18, 19, 20, 21],
    tue: [13, 14, 15, 16, 17, 18, 19, 20, 21],
    wed: [13, 14, 15, 16, 17],
    thu: [13, 14, 15, 16, 17, 18, 19, 20, 21],
    fri: [13, 14, 15, 16, 17, 18, 19, 20, 21],
    sat: [13, 14, 15, 16, 17, 18, 19, 20, 21],
    sun: [13, 14, 15, 16, 17],
  },
  socialLinks: {
    instagram: "mohen.tattoo",
    line: "mohenstudio",
  },
  preSessionDocuments: [
    {
      documentId: "mock-consent-in-person",
      title: "刺青同意書",
      description: "請客戶到店簽名後，上傳已簽署文件掃描或照片。",
      templateFileUrl: "https://placehold.co/600x800?text=Consent+Form",
      signatureMode: "in_person",
      isRequired: true,
      sortOrder: 0,
      createdAt: new Date("2025-01-01"),
    },
    {
      documentId: "mock-health-online",
      title: "健康聲明",
      description: "客戶可於預約成立後提前線上簽署。",
      templateFileUrl: "https://placehold.co/600x800?text=Health+Declaration",
      signatureMode: "online_advance",
      isRequired: true,
      sortOrder: 1,
      createdAt: new Date("2025-01-01"),
    },
  ],
};

export const mockStudios: Studio[] = [mockStudio];
