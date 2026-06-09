import { NextResponse } from "next/server";
import { getFirebaseAdminCredentials } from "@/lib/firebase-admin-credentials";
import { getAdminAuth } from "@/lib/firebase-admin";

/**
 * Lightweight health check for production debugging (Firebase Admin on Render).
 * Does not expose secrets.
 */
export async function GET() {
  try {
    const { projectId, clientEmail } = getFirebaseAdminCredentials();
    getAdminAuth();

    return NextResponse.json({
      ok: true,
      firebase: {
        projectId,
        clientEmail,
        adminInitialized: true,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        ok: false,
        firebase: {
          adminInitialized: false,
          hint: message.includes("Missing")
            ? "Set FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY on Render"
            : message.includes("Invalid FIREBASE_ADMIN_PRIVATE_KEY")
              ? "Use single-line private key with \\n for line breaks"
              : "Check Render logs for details",
        },
      },
      { status: 503 },
    );
  }
}
