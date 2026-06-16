import { hardNavigate } from "@/lib/auth/hard-navigate";
import type { VerificationAudience } from "@/lib/auth/send-verification-email";
import { auth } from "@/lib/firebase";

function getSessionEndpoint(audience: VerificationAudience): string {
  return audience === "client" ? "/api/auth/client/session" : "/api/auth/session";
}

/** After email verification, refresh the HTTP session cookie then hard-navigate. */
export async function completeVerificationRedirect(
  redirectTo: string,
  audience: VerificationAudience,
): Promise<void> {
  const user = auth.currentUser;

  if (user) {
    try {
      await user.reload();
      const idToken = await user.getIdToken(true);
      await fetch(getSessionEndpoint(audience), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, redirectTo }),
      });
    } catch {
      // Best-effort session refresh; hard navigation still revalidates server auth.
    }
  }

  hardNavigate(redirectTo);
}
