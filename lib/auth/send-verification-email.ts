import { type User, sendEmailVerification } from "firebase/auth";
import { appendRedirectToUrl } from "@/lib/auth/sanitize-redirect";
import { getAppBaseUrl } from "@/lib/email/app-url";

export type VerificationAudience = "client" | "studio";

function getContinueUrl(
  audience: VerificationAudience,
  redirectTo?: string | null
): string {
  const base = getAppBaseUrl();
  const path =
    audience === "client" ? "/client/verify-email" : "/verify-email";
  return appendRedirectToUrl(`${base}${path}`, redirectTo);
}

async function sendViaFirebaseClient(
  user: User,
  audience: VerificationAudience,
  redirectTo?: string | null
) {
  await sendEmailVerification(user, {
    url: getContinueUrl(audience, redirectTo),
    handleCodeInApp: false,
  });
}

export async function sendRegistrationVerificationEmail(
  user: User,
  audience: VerificationAudience = "client",
  redirectTo?: string | null
) {
  if (user.emailVerified) {
    return;
  }

  const idToken = await user.getIdToken();
  const response = await fetch("/api/auth/send-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, audience, redirectTo }),
  });

  const data = await response.json();

  if (response.ok && data.sent) {
    return;
  }

  if (data.alreadyVerified) {
    return;
  }

  if (data.fallback === "firebase" || !response.ok) {
    try {
      await sendViaFirebaseClient(user, audience, redirectTo);
      return;
    } catch (firebaseError) {
      if (!response.ok && !data.fallback) {
        throw new Error(data.error ?? "寄送驗證信失敗");
      }
      throw firebaseError;
    }
  }
}

export async function resendRegistrationVerificationEmail(
  user: User,
  audience: VerificationAudience,
  redirectTo?: string | null
) {
  return sendRegistrationVerificationEmail(user, audience, redirectTo);
}
