"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { formatMessage } from "@/lib/i18n/format";
import {
  getActiveProjectDepositProof,
  getActiveProjectTimeSlot,
} from "@/lib/project/active-session-state";
import {
  formatSessionSlotLabel,
  getCurrentSessionIndex,
  getCurrentSessionPricing,
  getSessionProgressLabel,
} from "@/lib/project/session-schedule";
import type { Project } from "@/types/project";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DepositReviewPanel({ project }: { project: Project }) {
  const dict = useAppDictionary();
  const d = dict.dashboard;
  const dep = dict.deposit;
  const c = dict.common;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (project.status !== "deposit_submitted") {
    return null;
  }

  const activeSlot = getActiveProjectTimeSlot(project);
  const activeDeposit = getActiveProjectDepositProof(project);

  if (!activeSlot) {
    return null;
  }

  async function handleConfirm() {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/projects/${project.projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmDeposit: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? dep.confirmFailed);
        return;
      }

      router.refresh();
    } catch {
      setError(dep.confirmFailedRetry);
    } finally {
      setIsSubmitting(false);
    }
  }

  const sessionIndex = getCurrentSessionIndex(project);
  const sessionProgress = getSessionProgressLabel(project, dict.project);

  return (
    <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20">
      <CardHeader>
        <CardTitle>{d.depositReview}</CardTitle>
        <CardDescription>{dep.reviewDescriptionAlt}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {sessionProgress ? (
          <p className="text-sm font-medium">{sessionProgress}</p>
        ) : null}
        <p className="text-sm">
          <span className="text-muted-foreground">{dep.clientSelectedSlot}</span>
          {formatSessionSlotLabel(
            project,
            activeSlot,
            sessionIndex,
            dict,
          )}
        </p>

        {getCurrentSessionPricing(project) && (
          <p className="text-sm">
            <span className="text-muted-foreground">{d.depositDue}</span>
            NT${" "}
            {Number(
              getCurrentSessionPricing(project)!.depositRequired
            ).toLocaleString("en-US")}
            {sessionProgress
              ? formatMessage(dep.sessionSuffix, { index: sessionIndex })
              : ""}
          </p>
        )}

        {activeDeposit.depositProofUrl && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">{dep.transferProof}</p>
            <a
              href={activeDeposit.depositProofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block max-w-sm overflow-hidden rounded-lg border"
            >
              <Image
                src={activeDeposit.depositProofUrl}
                alt={dep.transferProofAlt}
                width={400}
                height={300}
                className="h-auto w-full object-contain"
                unoptimized
              />
            </a>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button
          type="button"
          disabled={isSubmitting}
          onClick={handleConfirm}
          className="w-fit"
        >
          {isSubmitting ? c.processing : d.depositConfirmed}
        </Button>
      </CardContent>
    </Card>
  );
}
