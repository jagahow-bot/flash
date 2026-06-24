import { createHash, randomBytes } from "crypto";

export const CLAIM_TOKEN_BYTES = 32;
export const CLAIM_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export function generateClaimToken(): string {
  return randomBytes(CLAIM_TOKEN_BYTES).toString("base64url");
}

export function hashClaimToken(token: string): string {
  return createHash("sha256").update(token.trim()).digest("hex");
}

export function isClaimTokenExpired(expiresAt: Date | undefined): boolean {
  if (!expiresAt) return true;
  return expiresAt.getTime() <= Date.now();
}

export function buildClaimUrl(baseUrl: string, token: string): string {
  const url = new URL("/claim", baseUrl.replace(/\/$/, ""));
  url.searchParams.set("token", token);
  return url.toString();
}
