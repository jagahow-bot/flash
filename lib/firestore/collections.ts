export const COLLECTIONS = {
  users: "users",
  studios: "studios",
  artists: "artists",
  projects: "projects",
  projectMessages: "messages",
} as const;

/** Subcollections under `studios/{studioId}`. */
export const STUDIO_SUBCOLLECTIONS = {
  billingMonths: "billingMonths",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
