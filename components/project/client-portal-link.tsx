"use client";

import { useMemo, useState } from "react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { getClientPortalPath } from "@/lib/project/client-portal-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ClientPortalLink({
  studioSlug,
  projectId,
}: {
  studioSlug: string;
  projectId: string;
}) {
  const dict = useAppDictionary();
  const cp = dict.clientPortal;
  const c = dict.common;
  const d = dict.dashboard;
  const [copied, setCopied] = useState(false);
  const path = getClientPortalPath(studioSlug, projectId);
  const fullUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return path;
    }

    return `${window.location.origin}${path}`;
  }, [path]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{cp.portalLink}</CardTitle>
        <CardDescription>{d.portalLinkExtendedDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 sm:flex-row">
        <Input readOnly value={fullUrl} className="font-mono text-xs sm:text-sm" />
        <Button
          type="button"
          variant="outline"
          className="shrink-0"
          onClick={handleCopy}
        >
          {copied ? c.copied : cp.copyLink}
        </Button>
      </CardContent>
    </Card>
  );
}
