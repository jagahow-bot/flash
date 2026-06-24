export const DEMO_CLIENT_PREFIX = "demo-client";

/** Display names for the three seeded preview bookings. */
export const DEMO_CLIENT_NAMES: Record<string, string> = {
  "demo-client-1": "Emma (demo)",
  "demo-client-2": "Marcus (demo)",
  "demo-client-3": "Sofia (demo)",
};

export const DEMO_INBOX_SUMMARIES: Record<string, string> = {
  "demo-client-1": "Emma (demo) · fine-line rose on forearm, minimal fill",
  "demo-client-2": "Marcus (demo) · panther flash upper arm, bold outlines",
  "demo-client-3": "Sofia (demo) · colorful koi back piece, bold outlines",
};

export function isDemoClientId(clientId: string): boolean {
  return clientId.startsWith(`${DEMO_CLIENT_PREFIX}-`);
}

export function getDemoClientName(clientId: string): string | undefined {
  return DEMO_CLIENT_NAMES[clientId];
}

export function getDemoInboxSummary(clientId: string): string | undefined {
  return DEMO_INBOX_SUMMARIES[clientId];
}
