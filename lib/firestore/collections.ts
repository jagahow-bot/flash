export const COLLECTIONS = {
  users: "users",
  studios: "studios",
  artists: "artists",
  projects: "projects",
  projectMessages: "messages",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
