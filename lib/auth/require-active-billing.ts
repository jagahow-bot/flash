import { getStudioById } from "@/lib/firestore/studios.server";
import { isStudioBillingSuspended } from "@/lib/billing/studio-billing.server";

export async function isStudioBillingBlocked(
  studioId: string
): Promise<boolean> {
  const studio = await getStudioById(studioId);
  if (!studio) return false;
  return isStudioBillingSuspended(studio);
}
