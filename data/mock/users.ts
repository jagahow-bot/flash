import type { User } from "@/types/user";
import { MOCK_STUDIO_ID, MOCK_USER_IDS } from "@/data/mock/ids";

export const mockUsers: User[] = [
  {
    uid: MOCK_USER_IDS.admin,
    email: "admin@test.com",
    role: "admin",
    studioId: MOCK_STUDIO_ID,
  },
  {
    uid: MOCK_USER_IDS.artist,
    email: "artist@test.com",
    role: "artist",
    studioId: MOCK_STUDIO_ID,
  },
  {
    uid: MOCK_USER_IDS.client,
    email: "client@test.com",
    role: "client",
  },
  {
    uid: MOCK_USER_IDS.client2,
    email: "client2@test.com",
    role: "client",
  },
];

export const mockAdminUser = mockUsers[0];
export const mockArtistUser = mockUsers[1];
