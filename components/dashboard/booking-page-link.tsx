"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";

export function BookingPageLink({
  studioSlug,
  siteUrl,
  label,
}: {
  studioSlug: string;
  siteUrl: string;
  label: string;
}) {
  const dict = useAppDictionary();
  const path = `/${studioSlug}/book`;
  const fullUrl = `${siteUrl.replace(/\/$/, "")}${path}`;
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  const copyLabel = copied ? dict.common.copied : dict.clientPortal.copyLink;

  return (
    <p className="text-muted-foreground">
      {label}:{" "}
      <span className="inline-flex flex-wrap items-center gap-0.5">
        <Link
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all font-semibold text-primary underline underline-offset-4"
        >
          {fullUrl}
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={handleCopy}
          aria-label={copyLabel}
          title={copyLabel}
        >
          {copied ? <Check /> : <Copy />}
        </Button>
      </span>
    </p>
  );
}
