"use client";

import Link from "next/link";
import { useState } from "react";
import { type FirebaseError } from "firebase/app";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { resendRegistrationVerificationEmail } from "@/lib/auth/send-verification-email";
import type { VerificationAudience } from "@/lib/auth/send-verification-email";
import { auth } from "@/lib/firebase";
import { formatMessage } from "@/lib/i18n/format";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EmailVerificationCardProps {
  email: string;
  audience: VerificationAudience;
  redirectTo?: string | null;
  homeHref: string;
  homeLabel: string;
}

export function EmailVerificationCard({
  email,
  audience,
  redirectTo,
  homeHref,
  homeLabel,
}: EmailVerificationCardProps) {
  const dict = useAppDictionary();
  const t = dict.auth;
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleResend() {
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        setError(t.resendLoginRequired);
        return;
      }

      if (user.emailVerified) {
        setMessage(t.emailVerified);
        return;
      }

      await resendRegistrationVerificationEmail(user, audience, redirectTo);
      setMessage(t.verificationSent);
    } catch (error) {
      const code = (error as FirebaseError).code;
      if (code === "auth/too-many-requests") {
        setError(t.resendTooMany);
      } else {
        setError((error as Error).message || t.resendFailed);
      }
    } finally {
      setLoading(false);
    }
  }

  const continueHref =
    redirectTo && redirectTo.startsWith("/") ? redirectTo : homeHref;

  const description =
    audience === "client"
      ? formatMessage(t.verifyEmailDescriptionWithEmail, { email })
      : t.verifyEmailDescription;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t.verifyEmailTitle}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>{t.verifyEmailStep1}</li>
          <li>{t.verifyEmailStep2}</li>
        </ol>

        {message && (
          <p className="text-sm text-foreground" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Link
          href={continueHref}
          className={cn(buttonVariants(), "w-full")}
        >
          {t.verifyEmailContinue}
        </Link>

        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={handleResend}
        >
          {loading ? t.resending : t.resendVerification}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href={homeHref}
            className="text-foreground underline-offset-4 hover:underline"
          >
            {t.backToPrefix}{homeLabel}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
