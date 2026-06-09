import { resolveAppBaseUrl } from "@/lib/env/app-base-url";

export function getSiteUrl(): string {
  return resolveAppBaseUrl();
}
