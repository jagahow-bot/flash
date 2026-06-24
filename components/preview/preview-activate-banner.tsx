"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
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

const MIN_PASSWORD_LENGTH = 6;

export function PreviewActivateBanner({
  email,
  studioName,
}: {
  email: string;
  studioName: string;
}) {
  const dict = useAppDictionary();
  const p = dict.preview;
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(p.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setError(p.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      let idToken: string;

      try {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        idToken = await credential.user.getIdToken();
      } catch (authError: unknown) {
        const code =
          typeof authError === "object" &&
          authError !== null &&
          "code" in authError
            ? String(authError.code)
            : "";

        if (code === "auth/email-already-in-use") {
          const credential = await signInWithEmailAndPassword(
            auth,
            email,
            password,
          );
          idToken = await credential.user.getIdToken();
        } else {
          throw authError;
        }
      }

      const response = await fetch("/api/studios/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = (await response.json()) as {
        error?: string;
        redirect?: string;
      };

      if (!response.ok) {
        await auth.signOut().catch(() => undefined);
        setError(data.error ?? p.activateFailed);
        return;
      }

      router.push(data.redirect ?? "/dashboard");
      router.refresh();
    } catch {
      await auth.signOut().catch(() => undefined);
      setError(p.activateFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle>{p.activateTitle}</CardTitle>
        <CardDescription>
          {p.activateDescription.replace("{studioName}", studioName)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="preview-email">{p.emailLabel}</Label>
            <Input id="preview-email" value={email} readOnly disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="preview-password">{p.passwordLabel}</Label>
            <Input
              id="preview-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={MIN_PASSWORD_LENGTH}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="preview-confirm-password">
              {p.confirmPasswordLabel}
            </Label>
            <Input
              id="preview-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={MIN_PASSWORD_LENGTH}
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={loading}>
            {loading ? p.activating : p.activateButton}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
