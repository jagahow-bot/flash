"use client";

import { useAppDictionary } from "@/components/providers/locale-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ArtistAwaitingStudio({ email }: { email: string }) {
  const s = useAppDictionary().setup;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{s.awaitingTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{email}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{s.awaitingCardTitle}</CardTitle>
          <CardDescription>{s.awaitingDescription}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {s.awaitingHint}
        </CardContent>
      </Card>
    </div>
  );
}
