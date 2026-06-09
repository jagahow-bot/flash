"use client";

import { ChevronDown, Clock, ImageIcon } from "lucide-react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { formatMessage } from "@/lib/i18n/format";
import { formatFullDateLabel } from "@/lib/project/format";
import {
  buildSessionHistory,
  formatSessionHistoryTime,
  getSessionHistoryDepositStatus,
  getSessionHistoryPhaseLabel,
  shouldShowSessionHistory,
  shouldShowSessionHistoryDepositAmount,
  type SessionHistoryItem,
} from "@/lib/project/session-history";
import { getSessionProgressLabel } from "@/lib/project/session-schedule";
import type { Project } from "@/types/project";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PHASE_STYLES: Record<SessionHistoryItem["phase"], string> = {
  completed:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
  delivery_pending:
    "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-200",
  deposit_review:
    "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-200",
  pending_payment:
    "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200",
  scheduling:
    "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200",
  upcoming: "border-border bg-muted/40 text-muted-foreground",
};

export function SessionHistoryPanel({
  project,
  audience = "client",
}: {
  project: Project;
  audience?: "client" | "studio";
}) {
  const dict = useAppDictionary();
  const p = dict.project;

  if (!shouldShowSessionHistory(project)) {
    return null;
  }

  const items = buildSessionHistory(project, dict);
  const progress = getSessionProgressLabel(project, p);

  if (items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{p.sessionScheduleTitle}</CardTitle>
        <CardDescription>
          {progress
            ? formatMessage(p.sessionScheduleHintWithProgress, { progress })
            : p.sessionScheduleHint}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {items.map((item) => (
          <SessionHistoryItem
            key={item.sessionIndex}
            item={item}
            project={project}
            audience={audience}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function SessionHistoryItem({
  item,
  project,
  audience,
}: {
  item: SessionHistoryItem;
  project: Project;
  audience: "client" | "studio";
}) {
  const dict = useAppDictionary();
  const p = dict.project;
  const dep = dict.deposit;
  const a = dict.assets;

  const timeLabel = formatSessionHistoryTime(project, item, dict);
  const depositStatus = getSessionHistoryDepositStatus(
    project,
    item,
    p,
    dict.common.emptyDash,
  );
  const phaseLabel = getSessionHistoryPhaseLabel(item.phase, p);

  return (
    <details
      className="group rounded-lg border border-border/70 bg-background/50"
      open={item.defaultExpanded}
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden"
        )}
      >
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-medium">
              {formatMessage(a.sessionBadge, { index: item.sessionIndex })}
              {item.isCurrent ? (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {a.inProgress}
                </span>
              ) : null}
            </p>
            {timeLabel ? (
              <p className="truncate text-sm text-muted-foreground">{timeLabel}</p>
            ) : (
              <p className="text-sm text-muted-foreground">{p.slotNotScheduled}</p>
            )}
          </div>
          <span
            className={cn(
              "inline-flex w-fit shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
              PHASE_STYLES[item.phase]
            )}
          >
            {phaseLabel}
          </span>
        </div>
      </summary>

      <div className="space-y-3 border-t border-border/70 px-4 py-3 text-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">{p.bookingSlotTitle}</p>
              <p className="text-muted-foreground">
                {timeLabel ?? a.notScheduledShort}
              </p>
            </div>
          </div>
          <div>
            <p className="font-medium">{p.depositStatus}</p>
            <p className="text-muted-foreground">
              {depositStatus}
              {shouldShowSessionHistoryDepositAmount(item) &&
              !depositStatus.includes(item.depositLabel!)
                ? ` · ${item.depositLabel}`
                : null}
            </p>
          </div>
        </div>

        {item.confirmedAt ? (
          <p className="text-xs text-muted-foreground">
            {formatMessage(dep.confirmedAt, {
              date: formatFullDateLabel(item.confirmedAt, dict.dates),
            })}
          </p>
        ) : null}

        {item.depositSubmittedAt && !item.confirmedAt ? (
          <p className="text-xs text-muted-foreground">
            {formatMessage(dep.depositProofUploadedAt, {
              date: formatFullDateLabel(item.depositSubmittedAt, dict.dates),
            })}
          </p>
        ) : null}

        {item.depositProofUrl ? (
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-1.5 font-medium">
              <ImageIcon className="size-4" />
              {dep.depositProof}
            </p>
            <a
              href={item.depositProofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-fit overflow-hidden rounded-lg border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.depositProofUrl}
                alt={formatMessage(dep.depositProofAlt, {
                  index: item.sessionIndex,
                })}
                className="max-h-40 w-auto object-contain"
              />
            </a>
            {audience === "studio" ? (
              <p className="text-xs text-muted-foreground">
                {dep.clickToEnlarge}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </details>
  );
}
