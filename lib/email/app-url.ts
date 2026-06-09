import { resolveAppBaseUrl } from "@/lib/env/app-base-url";

export function getAppBaseUrl(): string {
  return resolveAppBaseUrl();
}
