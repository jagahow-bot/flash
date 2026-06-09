"use client";

import { AlertTriangle, Sparkles } from "lucide-react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { FLASH_PRODUCT } from "@/lib/branding";
import {
  getComplexityLabel,
  getConfidenceLabel,
  sanitizeManagerNotes,
} from "@/lib/copy";
import type { TattooBrief } from "@/types/tattoo-brief";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const COMPLEXITY_STYLES = {
  Low: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  Medium: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  High: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
};

export function TattooBriefPanel({ brief }: { brief?: TattooBrief }) {
  const dict = useAppDictionary();

  if (!brief) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dict.dashboard.briefTitle}</CardTitle>
          <CardDescription>{dict.dashboard.briefLoading}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4" />
              {FLASH_PRODUCT} {dict.dashboard.briefTitle.replace(/^FLASH\s*/, "")}
            </CardTitle>
            <CardDescription className="mt-1.5">
              {dict.dashboard.briefPrivateNote}
            </CardDescription>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              COMPLEXITY_STYLES[brief.complexity]
            )}
          >
            {dict.dashboard.complexityLabel} {getComplexityLabel(brief.complexity, dict)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">{dict.dashboard.summaryLabel}</p>
          <p className="mt-1 leading-relaxed">{brief.summary}</p>
        </div>

        {brief.keyElements.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground">{dict.dashboard.keyElementsLabel}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {brief.keyElements.map((element) => (
                <span
                  key={element}
                  className="rounded-full bg-muted px-3 py-1 text-xs font-medium"
                >
                  {element}
                </span>
              ))}
            </div>
          </div>
        )}

        {brief.photoSizeEstimate && (
          <div className="rounded-lg bg-muted/60 px-3 py-3">
            <p className="text-xs text-muted-foreground">{dict.dashboard.photoSizeEstimateLabel}</p>
            <p className="mt-1 font-medium">
              {brief.photoSizeEstimate.estimatedSize}
            </p>
            <p className="mt-1 text-muted-foreground">
              {dict.dashboard.confidenceLabel}：{getConfidenceLabel(brief.photoSizeEstimate.confidence, dict)}
              {brief.photoSizeEstimate.notes
                ? ` · ${brief.photoSizeEstimate.notes}`
                : ""}
            </p>
          </div>
        )}

        {brief.riskFlags.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">{dict.dashboard.riskFlagsLabel}</p>
            {brief.riskFlags.map((flag, index) => (
              <div
                key={`${flag.reason}-${index}`}
                className={cn(
                  "flex gap-2 rounded-lg px-3 py-2",
                  flag.level === "danger"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100"
                )}
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <p>{flag.reason}</p>
              </div>
            ))}
          </div>
        )}

        {sanitizeManagerNotes(brief.managerNotes) && (
          <div>
            <p className="text-xs text-muted-foreground">{dict.dashboard.internalNotesLabel}</p>
            <p className="mt-1 leading-relaxed text-muted-foreground">
              {sanitizeManagerNotes(brief.managerNotes)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
