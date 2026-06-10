"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { type FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useAppDictionary } from "@/components/providers/locale-provider";
import {
  getGoogleAuthErrorMessage,
  signInWithGoogle,
  useGoogleRedirectSignIn,
} from "@/lib/auth/google-sign-in";
import { sendRegistrationVerificationEmail } from "@/lib/auth/send-verification-email";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MIN_PASSWORD_LENGTH = 6;

export function RegisterForm() {
  const dict = useAppDictionary();
  const t = dict.auth;
  const c = dict.common;
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function completeRegistration(idToken: string, emailVerified: boolean) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      await auth.signOut();
      if (response.status === 409) {
        setError(t.emailInUse);
      } else {
        setError(data.error ?? t.registerFailed);
      }
      return;
    }

    if (!emailVerified) {
      const user = auth.currentUser;
      if (user) {
        await sendRegistrationVerificationEmail(user, "studio");
      }
      const verifyUrl = new URL("/verify-email", window.location.origin);
      const nextRedirect = data.redirect ?? "/setup";
      verifyUrl.searchParams.set("redirect", nextRedirect);
      router.push(`${verifyUrl.pathname}${verifyUrl.search}`);
      router.refresh();
      return;
    }

    router.push(data.redirect ?? "/setup");
    router.refresh();
  }

  useGoogleRedirectSignIn(
    async (credential) => {
      setError(null);
      setLoading(true);

      try {
        await completeRegistration(
          await credential.user.getIdToken(),
          credential.user.emailVerified
        );
      } catch (error) {
        await auth.signOut().catch(() => undefined);
        setError(getGoogleAuthErrorMessage(error, t) ?? t.googleLoginFailed);
      } finally {
        setLoading(false);
      }
    },
    (error) => {
      void auth.signOut().catch(() => undefined);
      const message = getGoogleAuthErrorMessage(error, t);
      if (message) {
        setError(message);
      }
      setLoading(false);
    }
  );

  async function handleGoogle() {
    setError(null);
    setLoading(true);

    try {
      const credential = await signInWithGoogle();
      if (!credential) {
        return;
      }

      await completeRegistration(
        await credential.user.getIdToken(),
        credential.user.emailVerified
      );
    } catch (error) {
      await auth.signOut().catch(() => undefined);
      const message = getGoogleAuthErrorMessage(error, t);
      if (message) {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t.passwordMinLength);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await completeRegistration(
        await credential.user.getIdToken(),
        credential.user.emailVerified
      );
    } catch (error) {
      await auth.signOut().catch(() => undefined);

      const code = (error as FirebaseError).code;

      if (code === "auth/email-already-in-use") {
        setError(t.emailInUse);
      } else if (code === "auth/invalid-email") {
        setError(t.invalidEmail);
      } else if (code === "auth/weak-password") {
        setError(t.passwordMinLength);
      } else if (code === "auth/operation-not-allowed") {
        setError(t.registerNotEnabled);
      } else {
        setError(t.registerFailed);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t.registerStudioTitle}</CardTitle>
        <CardDescription>{t.registerStudioDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={handleGoogle}
          className="w-full"
        >
          {t.continueWithGoogle}
        </Button>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          {t.orUseEmail}
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{c.email}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{c.password}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={MIN_PASSWORD_LENGTH}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-password">{c.confirmPassword}</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={MIN_PASSWORD_LENGTH}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t.registering : t.createAccount}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t.hasAccount}{" "}
            <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
              {t.login}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
