"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { auth } from "@/lib/firebase";
import { EmailVerificationCard } from "@/components/auth/email-verification-card";
import { completeVerificationRedirect } from "@/lib/auth/complete-verification-redirect";
import { sanitizeRedirectTo } from "@/lib/auth/sanitize-redirect";
import type { VerificationAudience } from "@/lib/auth/send-verification-email";

interface VerifyEmailPageProps {
  audience: VerificationAudience;
  homeHref: string;
  homeLabel: string;
}

export function VerifyEmailPage({
  audience,
  homeHref,
  homeLabel,
}: VerifyEmailPageProps) {
  const dict = useAppDictionary();
  const t = dict.auth;
  const c = dict.common;
  const searchParams = useSearchParams();
  const redirectTo = sanitizeRedirectTo(searchParams.get("redirect"));
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setEmail(null);
        setLoading(false);
        return;
      }

      try {
        await user.reload();
      } catch {
        // ignore reload errors; still show verification UI
      }

      const current = auth.currentUser;
      setEmail(current?.email ?? user.email ?? null);

      if (current?.emailVerified && redirectTo) {
        await completeVerificationRedirect(redirectTo, audience);
        return;
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [audience, redirectTo]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">{c.loading}</p>;
  }

  if (!email) {
    return (
      <p className="text-sm text-muted-foreground">
        {t.verifyEmailLoginRequired}
      </p>
    );
  }

  return (
    <EmailVerificationCard
      email={email}
      audience={audience}
      redirectTo={redirectTo}
      homeHref={homeHref}
      homeLabel={homeLabel}
    />
  );
}
