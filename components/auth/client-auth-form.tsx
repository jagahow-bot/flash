"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
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

type ClientAuthMode = "login" | "register";

async function establishClientSession(idToken: string, redirectTo: string | null) {
  const sessionResponse = await fetch("/api/auth/client/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, redirectTo }),
  });

  if (sessionResponse.ok) {
    return sessionResponse.json();
  }

  if (sessionResponse.status !== 403) {
    const data = await sessionResponse.json();
    throw new Error(data.error ?? "login failed");
  }

  const registerResponse = await fetch("/api/auth/client/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, redirectTo }),
  });
  const registerData = await registerResponse.json();

  if (!registerResponse.ok) {
    throw new Error(registerData.error ?? "register failed");
  }

  return registerData;
}

export function ClientAuthForm({ mode }: { mode: ClientAuthMode }) {
  const dict = useAppDictionary();
  const t = dict.auth;
  const c = dict.common;
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function completeAuth(
    idToken: string,
    options?: { needsEmailVerification?: boolean }
  ) {
    const data = await establishClientSession(idToken, redirectTo);

    if (options?.needsEmailVerification) {
      const verifyUrl = new URL("/client/verify-email", window.location.origin);
      const nextRedirect = data.redirect ?? redirectTo;
      if (nextRedirect) {
        verifyUrl.searchParams.set("redirect", nextRedirect);
      }
      router.push(`${verifyUrl.pathname}${verifyUrl.search}`);
      router.refresh();
      return;
    }

    router.push(data.redirect ?? redirectTo ?? "/");
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (isRegister) {
      if (password.length < 6) {
        setError(t.passwordMinLength);
        return;
      }

      if (password !== confirmPassword) {
        setError(t.passwordMismatch);
        return;
      }
    }

    setLoading(true);

    try {
      const credential = isRegister
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);

      const needsEmailVerification =
        isRegister && !credential.user.emailVerified;

      if (needsEmailVerification) {
        await sendRegistrationVerificationEmail(
          credential.user,
          "client",
          redirectTo
        );
      }

      await completeAuth(await credential.user.getIdToken(), {
        needsEmailVerification,
      });
    } catch (error) {
      await auth.signOut().catch(() => undefined);

      const code = (error as FirebaseError).code;
      const message = (error as Error).message;

      if (code === "auth/email-already-in-use") {
        setError(t.emailInUse);
      } else if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password"
      ) {
        setError(t.invalidCredentials);
      } else if (code === "auth/user-not-found") {
        setError(t.clientNotRegistered);
      } else if (code === "auth/invalid-email") {
        setError(t.invalidEmail);
      } else if (message.includes("studio account")) {
        setError(t.operationFailed);
      } else {
        setError(message || t.operationFailed);
      }
    } finally {
      setLoading(false);
    }
  }

  useGoogleRedirectSignIn(
    async (credential) => {
      setError(null);
      setLoading(true);

      try {
        await completeAuth(await credential.user.getIdToken());
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

      await completeAuth(await credential.user.getIdToken());
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

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isRegister ? t.clientRegister : t.clientLogin}</CardTitle>
        <CardDescription>{t.clientAuthDescription}</CardDescription>
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
            <Label htmlFor="client-email">{c.email}</Label>
            <Input
              id="client-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="client-password">{c.password}</Label>
            <Input
              id="client-password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={isRegister ? 6 : undefined}
              required
            />
          </div>
          {isRegister && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="client-confirm-password">{c.confirmPassword}</Label>
              <Input
                id="client-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={6}
                required
              />
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? c.processing
              : isRegister
                ? t.createAccount
                : t.login}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isRegister ? (
            <>
              {t.hasAccount}{" "}
              <Link
                href={`/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
                className="text-foreground underline-offset-4 hover:underline"
              >
                {t.login}
              </Link>
            </>
          ) : (
            <>
              {t.noClientAccount}{" "}
              <Link
                href={`/client/register${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
                className="text-foreground underline-offset-4 hover:underline"
              >
                {t.clientRegisterLink}
              </Link>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
