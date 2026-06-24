/**
 * Patch existing demo preview projects with "(demo)" client names.
 *
 * Usage: npm run patch:demo-client-names
 */

import { COLLECTIONS } from "../lib/firestore/collections";
import { getAdminDb } from "../lib/firebase-admin";
import {
  DEMO_CLIENT_PREFIX,
  getDemoClientName,
  getDemoInboxSummary,
} from "../lib/studio/demo-client-names";

async function patchDemoClientNames() {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTIONS.projects)
    .where("clientId", ">=", DEMO_CLIENT_PREFIX)
    .where("clientId", "<=", `${DEMO_CLIENT_PREFIX}\uf8ff`)
    .get();

  if (snapshot.empty) {
    console.log("No demo projects found.");
    return;
  }

  let updated = 0;
  let skipped = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const clientId = typeof data.clientId === "string" ? data.clientId : "";
    const clientName = getDemoClientName(clientId);
    const inboxSummary = getDemoInboxSummary(clientId);

    if (!clientName) {
      skipped += 1;
      continue;
    }

    const existingName = (
      data.intakeForm as { socialContacts?: { clientName?: string } } | undefined
    )?.socialContacts?.clientName;
    const existingInbox = (
      data.tattooBrief as { inboxSummary?: string } | undefined
    )?.inboxSummary;

    if (existingName === clientName && existingInbox === inboxSummary) {
      skipped += 1;
      continue;
    }

    const patch: Record<string, string> = {
      "intakeForm.socialContacts.clientName": clientName,
    };

    if (inboxSummary) {
      patch["tattooBrief.inboxSummary"] = inboxSummary;
    }

    await doc.ref.update(patch);
    updated += 1;
    console.log(`  ✓ ${doc.id} (${clientId}) → ${clientName}`);
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped (${snapshot.size} total).`);
}

patchDemoClientNames().catch((error) => {
  console.error("Patch failed:", error);
  process.exit(1);
});
