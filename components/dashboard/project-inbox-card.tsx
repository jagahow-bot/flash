"use client";

import Link from "next/link";
import { AlertCircle, AlertTriangle, ChevronRight, MessageSquare } from "lucide-react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { formatMessage } from "@/lib/i18n/format";
import {
  formatIntakeColorMode,
  formatIntakeStyle,
} from "@/lib/intake/display";
import {
  getInboxProjectSize,
  getInboxProjectSummary,
} from "@/lib/project/inbox-display";
import {
  getInboxStatusLabel,
  getInboxStatusStyleKey,
} from "@/lib/project/inbox-eligibility";
import { getSessionInboxPriceLabel } from "@/lib/project/session-schedule";
import type { Project } from "@/types/project";
import type { Studio } from "@/types/studio";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<Project["status"], string> = {
  pending_brief: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  quoting: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  pending_payment: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200",
  deposit_submitted:
    "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200",
  booked: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground line-through",
};

const INBOX_STATUS_STYLES: Record<string, string> = {
  ...STATUS_STYLES,
  awaitingAssets:
    "bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200",
  awaitingSession:
    "bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200",
  awaitingSignature:
    "bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200",
  awaitingDeposit:
    "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200",
  awaitingQuote:
    "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
};

function InboxField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium">{value}</p>
    </div>
  );
}

export function ProjectInboxCard({
  project,
  studio,
  artistName,
  unreadDiscussionCount = 0,
}: {
  project: Project;
  studio?: Studio;
  artistName?: string | null;
  unreadDiscussionCount?: number;
}) {
  const dict = useAppDictionary();
  const hasDanger = project.tattooBrief?.riskFlags.some(
    (flag) => flag.level === "danger",
  );
  const sessionPriceLabel = getSessionInboxPriceLabel(project, dict);
  const { summary, riskFlags } = getInboxProjectSummary(project, dict);
  const sizeLabel = getInboxProjectSize(project);
  const statusLabel = getInboxStatusLabel(project, dict, studio);
  const statusStyleKey = getInboxStatusStyleKey(project, studio);
  const empty = dict.common.emptyDash;

  const colorModeLabel =
    formatIntakeColorMode(project.intakeForm.colorMode, dict) || empty;

  const fields = [
    { key: "placement", label: dict.dashboard.placement, value: project.intakeForm.placement?.trim() || empty },
    {
      key: "style",
      label: dict.dashboard.style,
      value: formatIntakeStyle(project.intakeForm.style, dict) || empty,
    },
    { key: "colorMode", label: dict.dashboard.colorMode, value: colorModeLabel },
    { key: "size", label: dict.dashboard.size, value: sizeLabel },
    { key: "artist", label: dict.dashboard.artist, value: artistName?.trim() || dict.dashboard.unassigned },
  ] as const;

  return (
    <Link
      href={`/dashboard/projects/${project.projectId}`}
      className={cn(
        "group flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40",
        unreadDiscussionCount > 0 &&
          "border-amber-300 bg-amber-50/50 ring-1 ring-amber-200/80 dark:border-amber-800 dark:bg-amber-950/20",
      )}
    >
      <div className="flex items-start justify-end">
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
            INBOX_STATUS_STYLES[statusStyleKey] ?? STATUS_STYLES[project.status],
          )}
        >
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {fields.map(({ key, label, value }) => (
          <InboxField key={key} label={label} value={value} />
        ))}
      </div>

      <p className="line-clamp-2 text-sm leading-snug text-foreground/90">
        {summary}
      </p>

      {riskFlags.length > 0 ? (
        <div className="flex flex-col gap-1">
          {riskFlags.map((flag, index) => (
            <p
              key={`${flag.level}-${index}`}
              className={cn(
                "flex items-start gap-1.5 text-xs leading-snug",
                flag.level === "danger"
                  ? "text-destructive"
                  : "text-amber-800 dark:text-amber-200",
              )}
            >
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              <span>
                {dict.dashboard.watchOut}
                {flag.reason}
              </span>
            </p>
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="min-w-0 truncate">
          {dict.dashboard.projectCode} {project.projectId}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {unreadDiscussionCount > 0 && (
            <span className="inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-300">
              <MessageSquare className="size-3.5" />
              {formatMessage(dict.dashboard.newMessages, {
                count: unreadDiscussionCount,
              })}
            </span>
          )}
          {hasDanger && (
            <span className="inline-flex items-center gap-1 text-destructive">
              <AlertCircle className="size-3.5" />
              {dict.dashboard.highRisk}
            </span>
          )}
          {sessionPriceLabel ? <span>{sessionPriceLabel}</span> : null}
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
