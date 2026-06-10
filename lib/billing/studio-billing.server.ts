import { getStudioById } from "@/lib/firestore/studios.server";
import { updateStudioFields } from "@/lib/firestore/studios.server";
import type { StudioBillingStatus } from "@/types/billing";
import type { Studio } from "@/types/studio";

export function isStudioBillingSuspended(studio: Studio): boolean {
  return studio.billingStatus === "suspended";
}

export async function getStudioBillingState(
  studioId: string
): Promise<Studio | null> {
  return getStudioById(studioId);
}

export async function setStudioBillingStatus(
  studioId: string,
  billingStatus: StudioBillingStatus
): Promise<void> {
  await updateStudioFields(studioId, { billingStatus });
}

export async function linkStripeCustomer(
  studioId: string,
  stripeCustomerId: string,
  stripeSubscriptionId?: string
): Promise<void> {
  await updateStudioFields(studioId, {
    stripeCustomerId,
    ...(stripeSubscriptionId ? { stripeSubscriptionId } : {}),
  });
}
