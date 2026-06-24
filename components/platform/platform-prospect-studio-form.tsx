"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppDictionary } from "@/components/providers/locale-provider";

type CreateProspectResponse = {
  studioId: string;
  slug: string;
  claimUrl: string;
  storefrontUrl: string;
  demoProjectIds: string[];
  emailQueued?: boolean;
  error?: string;
};

export function PlatformProspectStudioForm({
  onCreated,
}: {
  onCreated?: () => void | Promise<void>;
}) {
  const dict = useAppDictionary();
  const pa = dict.platformAdmin;
  const [prospectEmail, setProspectEmail] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateProspectResponse | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/platform/prospect-studios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectEmail,
          name,
          slug: slug.trim() || undefined,
          bio: bio.trim() || undefined,
          sendEmail,
        }),
      });

      const data = (await response.json()) as CreateProspectResponse;

      if (!response.ok) {
        setError(data.error ?? pa.prospectCreateFailed);
        return;
      }

      setResult(data);
      setProspectEmail("");
      setName("");
      setSlug("");
      setBio("");
      await onCreated?.();
    } catch {
      setError(pa.prospectCreateFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{pa.prospectTitle}</CardTitle>
        <CardDescription>{pa.prospectDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="prospect-email">{pa.prospectEmailLabel}</Label>
            <Input
              id="prospect-email"
              type="email"
              required
              value={prospectEmail}
              onChange={(event) => setProspectEmail(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prospect-name">{pa.prospectNameLabel}</Label>
            <Input
              id="prospect-name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prospect-slug">{pa.prospectSlugLabel}</Label>
            <Input
              id="prospect-slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="ink-studio"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prospect-bio">{pa.prospectBioLabel}</Label>
            <Textarea
              id="prospect-bio"
              rows={3}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={sendEmail}
              onCheckedChange={(checked) => setSendEmail(checked === true)}
            />
            {pa.prospectSendEmailLabel}
          </label>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={loading}>
            {loading ? pa.prospectCreating : pa.prospectCreateButton}
          </Button>
        </form>

        {result ? (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm">
            <p className="font-medium text-emerald-700 dark:text-emerald-400">
              {pa.prospectCreateSuccess}
            </p>
            <p className="mt-2 break-all">
              <span className="text-muted-foreground">
                {pa.prospectClaimUrlLabel}:{" "}
              </span>
              <a
                href={result.claimUrl}
                className="text-foreground underline"
                target="_blank"
                rel="noreferrer"
              >
                {result.claimUrl}
              </a>
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
