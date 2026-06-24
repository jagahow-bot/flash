"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppDictionary } from "@/components/providers/locale-provider";

type ScrapedStudioInput = {
  email: string;
  name: string;
  slug?: string;
  bio?: string;
  instagram?: string;
  facebook?: string;
  line?: string;
  threads?: string;
  country?: string;
  timezone?: string;
  logoUrl?: string;
  flashImageUrls?: string[];
  artistNames?: string[];
  isSoloStudio?: boolean;
  acceptsCoverUp?: boolean;
  extractionNotes?: string;
  source?: string;
  scrapedAt?: string;
};

type ImportResult = {
  email: string;
  name: string;
  ok: boolean;
  studioId?: string;
  slug?: string;
  claimUrl?: string;
  error?: string;
};

function parseImportPayload(raw: unknown): ScrapedStudioInput[] {
  if (Array.isArray(raw)) {
    return raw as ScrapedStudioInput[];
  }

  if (
    raw &&
    typeof raw === "object" &&
    Array.isArray((raw as { studios?: unknown }).studios)
  ) {
    return (raw as { studios: ScrapedStudioInput[] }).studios;
  }

  throw new Error("INVALID_JSON");
}

export function PlatformScraperImportForm({
  onImported,
}: {
  onImported?: () => void | Promise<void>;
}) {
  const dict = useAppDictionary();
  const pa = dict.platformAdmin;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<ScrapedStudioInput[]>([]);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError(null);
    setResults([]);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result ?? ""));
        const nextEntries = parseImportPayload(parsed);
        if (nextEntries.length === 0) {
          setError(pa.scraperImportEmpty);
          setEntries([]);
          return;
        }
        setEntries(nextEntries);
      } catch {
        setError(pa.scraperImportInvalidJson);
        setEntries([]);
      }
    };
    reader.readAsText(file, "utf8");
  }

  async function handleImport(event: FormEvent) {
    event.preventDefault();
    if (entries.length === 0) {
      setError(pa.scraperImportNoFile);
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    const nextResults: ImportResult[] = [];

    for (const entry of entries) {
      try {
        const response = await fetch("/api/platform/prospect-studios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: entry.email,
            name: entry.name,
            slug: entry.slug,
            bio: entry.bio,
            country: entry.country,
            instagram: entry.instagram,
            facebook: entry.facebook,
            line: entry.line,
            threads: entry.threads,
            logoUrl: entry.logoUrl,
            flashImageUrls: entry.flashImageUrls,
            artistNames: entry.artistNames,
            isSoloStudio: entry.isSoloStudio,
            acceptsCoverUp: entry.acceptsCoverUp,
            sendEmail: false,
          }),
        });

        const data = (await response.json()) as {
          error?: string;
          studioId?: string;
          slug?: string;
          claimUrl?: string;
        };

        if (!response.ok) {
          nextResults.push({
            email: entry.email,
            name: entry.name,
            ok: false,
            error: data.error ?? pa.prospectCreateFailed,
          });
          continue;
        }

        nextResults.push({
          email: entry.email,
          name: entry.name,
          ok: true,
          studioId: data.studioId,
          slug: data.slug,
          claimUrl: data.claimUrl,
        });
      } catch {
        nextResults.push({
          email: entry.email,
          name: entry.name,
          ok: false,
          error: pa.prospectCreateFailed,
        });
      }
    }

    setResults(nextResults);
    setLoading(false);

    if (nextResults.some((result) => result.ok)) {
      await onImported?.();
    }
  }

  function downloadResults() {
    const payload = results
      .filter((result) => result.ok)
      .map((result) => ({
        email: result.email,
        name: result.name,
        studioId: result.studioId,
        slug: result.slug,
        claimUrl: result.claimUrl,
        importedAt: new Date().toISOString(),
      }));

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "flash-prospects.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const successCount = results.filter((result) => result.ok).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{pa.scraperImportTitle}</CardTitle>
        <CardDescription>{pa.scraperImportDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleImport}>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="block w-full text-sm"
            onChange={handleFileChange}
          />

          {entries.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              {pa.scraperImportReady.replace("{count}", String(entries.length))}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={loading || entries.length === 0}>
              {loading ? pa.scraperImporting : pa.scraperImportButton}
            </Button>
            {successCount > 0 ? (
              <Button type="button" variant="outline" onClick={downloadResults}>
                {pa.scraperImportExport}
              </Button>
            ) : null}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {results.length > 0 ? (
            <div className="rounded-lg border p-3 text-sm">
              <p className="mb-2 font-medium">
                {pa.scraperImportSummary
                  .replace("{success}", String(successCount))
                  .replace("{total}", String(results.length))}
              </p>
              <ul className="space-y-2">
                {results.map((result) => (
                  <li key={`${result.email}-${result.name}`}>
                    <span className={result.ok ? "text-emerald-600" : "text-destructive"}>
                      {result.ok ? "✓" : "✗"} {result.name} ({result.email})
                    </span>
                    {result.claimUrl ? (
                      <div className="mt-1 break-all font-mono text-xs text-muted-foreground">
                        {result.claimUrl}
                      </div>
                    ) : null}
                    {result.error ? (
                      <div className="mt-1 text-xs text-destructive">{result.error}</div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
