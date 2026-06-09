"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAppDictionary } from "@/components/providers/locale-provider";
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

export function LoginForm() {
  const dict = useAppDictionary();
  const t = dict.auth;
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const idToken = await credential.user.getIdToken();

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, redirectTo }),
      });

      const data = await response.json();

      if (!response.ok) {
        await auth.signOut();
        setError(data.error ?? t.loginFailed);
        return;
      }

      router.push(data.redirect ?? "/");
      router.refresh();
    } catch (error) {
      const code = (error as FirebaseError).code;

      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        setError(t.invalidCredentials);
      } else if (code === "auth/user-not-found") {
        setError(t.userNotFound);
      } else if (code === "auth/invalid-email") {
        setError(t.invalidEmail);
      } else if (code === "auth/too-many-requests") {
        setError(t.tooManyRequests);
      } else if (code === "auth/operation-not-allowed") {
        setError(t.authNotEnabled);
      } else {
        setError(t.loginFailed);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t.login}</CardTitle>
        <CardDescription>{t.loginDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{dict.common.email}</Label>
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
            <Label htmlFor="password">{dict.common.password}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t.loggingIn : t.login}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t.noAccount}{" "}
            <Link
              href="/register"
              className="text-foreground underline-offset-4 hover:underline"
            >
              {t.registerStudio}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
