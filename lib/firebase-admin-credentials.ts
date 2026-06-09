export interface FirebaseAdminCredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

/**
 * Normalizes FIREBASE_ADMIN_PRIVATE_KEY from env (Render, Vercel, .env.local).
 * Handles surrounding quotes and literal `\n` sequences.
 */
export function parseFirebaseAdminPrivateKey(
  raw: string | undefined,
): string | undefined {
  if (!raw) return undefined;

  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }

  if (key.includes("\\n")) {
    key = key.replace(/\\n/g, "\n");
  }

  return key;
}

export function getFirebaseAdminCredentials(): FirebaseAdminCredentials {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const privateKey = parseFirebaseAdminPrivateKey(
    process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  );

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY.",
    );
  }

  if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    throw new Error(
      "Invalid FIREBASE_ADMIN_PRIVATE_KEY format. Paste the service account private_key as a single line with \\n for line breaks.",
    );
  }

  return { projectId, clientEmail, privateKey };
}
