"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDictionary } from "@/components/providers/locale-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ClaimPageClient() {
  const dict = useAppDictionary();
  const c = dict.claim;
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token")?.trim() ?? "";
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "verifying" | "done">("idle");
  const displayError = token ? error : c.missingToken;

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function verify() {
      setStatus("verifying");
      setError(null);

      try {
        const response = await fetch("/api/studios/verify-claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = (await response.json()) as {
          error?: string;
          redirect?: string;
        };

        if (!response.ok) {
          if (!cancelled) {
            setError(data.error ?? c.verifyFailed);
            setStatus("idle");
          }
          return;
        }

        if (!cancelled) {
          setStatus("done");
          router.replace(data.redirect ?? "/preview/dashboard");
          router.refresh();
        }
      } catch {
        if (!cancelled) {
          setError(c.verifyFailed);
          setStatus("idle");
        }
      }
    }

    void verify();

    return () => {
      cancelled = true;
    };
  }, [c.verifyFailed, router, token]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{c.title}</CardTitle>
          <CardDescription>
            {status === "verifying" ? c.verifying : c.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayError ? (
            <p className="text-sm text-destructive" role="alert">
              {displayError}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">{c.verifyingHint}</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
