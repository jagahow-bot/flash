import type { Artist } from "@/types/artist";
import { MOCK_ARTIST_IDS, MOCK_STUDIO_ID } from "@/data/mock/ids";

export const mockArtists: Artist[] = [
  {
    artistId: MOCK_ARTIST_IDS.main,
    studioId: MOCK_STUDIO_ID,
    userEmail: "artist@test.com",
    displayName: "阿墨",
    styles: ["細線", "寫實", "花卉"],
    bio: "工作室主理人，擅長細線與寫實花卉。",
    isActive: true,
  },
  {
    artistId: MOCK_ARTIST_IDS.second,
    studioId: MOCK_STUDIO_ID,
    displayName: "小禾",
    styles: ["日式傳統", "圖騰", "黑灰"],
    bio: "專注日式傳統與幾何圖騰，可搭配工作室共同時段排程。",
    isActive: true,
    weeklySchedule: {
      mon: { closed: false, start: "13:00", end: "17:00" },
      tue: { closed: false, start: "13:00", end: "21:00" },
      wed: { closed: true, start: "09:00", end: "21:00" },
      thu: { closed: false, start: "13:00", end: "17:00" },
      fri: { closed: false, start: "13:00", end: "21:00" },
      sat: { closed: false, start: "13:00", end: "21:00" },
      sun: { closed: false, start: "13:00", end: "17:00" },
    },
  },
];
