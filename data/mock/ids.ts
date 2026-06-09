/** Mock 資料用的固定 ID，seed 時可透過環境變數覆寫為真實 Firebase UID */

export const MOCK_STUDIO_ID = "studio_mohen";

export const MOCK_ARTIST_IDS = {
  main: "artist_mohen_main",
  second: "artist_mohen_second",
} as const;

export const MOCK_USER_IDS = {
  admin: "mock_admin_uid",
  artist: "mock_artist_uid",
  client: "mock_client_uid",
  client2: "mock_client_uid_2",
} as const;

export const MOCK_PROJECT_IDS = {
  pendingBrief: "MOHEN-20250601-001",
  quoting: "MOHEN-20250602-001",
  pendingPayment: "MOHEN-20250603-001",
  depositSubmitted: "MOHEN-20250604-001",
  booked: "MOHEN-20250605-001",
  bookedPreSession: "MOHEN-20250607-001",
  completed: "MOHEN-20250606-001",
} as const;
