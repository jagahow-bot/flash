export const SESSION_COOKIE_NAME = "__flash_session";

export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export const PROTECTED_ROUTES = ["/dashboard", "/setup", "/platform"] as const;

export const AUTH_ROUTES = [
  "/login",
  "/register",
  "/client/login",
  "/client/register",
] as const;

export const STUDIO_ROLES = ["admin", "artist"] as const;
