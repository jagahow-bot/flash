"use client";

import Link from "next/link";
import { ChevronRight, MessageSquare } from "lucide-react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { formatMessage } from "@/lib/i18n/format";
import { formatIntakeStyle } from "@/lib/intake/display";
import { getAppointmentDisplay } from "@/lib/project/appointment-display";
import {
  getClientProjectDescription,
  getClientProjectSize,
} from "@/lib/project/client-project-display";
import { getClientTimelineLabel } from "@/lib/project/status";
import type { Project } from "@/types/project";
import { cn } from "@/lib/utils";

function ClientField({
  label,
  value,
  subValue,
  valueClassName,
}: {
  label: string;
  value: string;
  subValue?: string;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("truncate text-sm font-medium", valueClassName)}>{value}</p>
      {subValue ? (
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{subValue}</p>
      ) : null}
    </div>
  );
}

export function ClientProjectCard({
  project,
  studioName,
  studioSlug,
  unreadCount = 0,
}: {
  project: Project;
  studioName: string;
  studioSlug: string;
  unreadCount?: number;
}) {
  const dict = useAppDictionary();
  const intake = project.intakeForm;
  const appointment = getAppointmentDisplay(project, dict);
  const description = getClientProjectDescription(project);
  const empty = dict.common.emptyDash;

  const fields = [
    { key: "studio", label: dict.clientPortal.studio, value: studioName.trim() || empty },
    { key: "placement", label: dict.dashboard.placement, value: intake.placement?.trim() || empty },
    {
      key: "style",
      label: dict.dashboard.style,
      value: formatIntakeStyle(intake.style, dict) || empty,
    },
    { key: "size", label: dict.dashboard.size, value: getClientProjectSize(project) },
    {
      key: "progress",
      label: dict.clientPortal.progress,
      value: getClientTimelineLabel(project.status, dict),
    },
    {
      key: "appointment",
      label: dict.clientPortal.nextAppointment,
      value: appointment.primary,
      subValue: appointment.secondary,
      valueClassName: appointment.isConfirmed
        ? "text-emerald-700 dark:text-emerald-300"
        : undefined,
    },
  ] as const;

  return (
    <Link
      href={`/${studioSlug}/p/${project.projectId}`}
      className={cn(
        "group flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40",
        unreadCount > 0 &&
          "border-amber-300 bg-amber-50/50 ring-1 ring-amber-200/80 dark:border-amber-800 dark:bg-amber-950/20",
      )}
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
        <ClientField label={fields[0].label} value={fields[0].value} />
        <ClientField label={fields[1].label} value={fields[1].value} />
        <ClientField label={fields[2].label} value={fields[2].value} />
        <ClientField label={fields[3].label} value={fields[3].value} />
        <ClientField label={fields[4].label} value={fields[4].value} />
        <ClientField
          label={fields[5].label}
          value={fields[5].value}
          subValue={fields[5].subValue}
          valueClassName={fields[5].valueClassName}
        />
      </div>

      {description ? (
        <p className="line-clamp-2 text-sm leading-snug text-foreground/90">
          {description}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="min-w-0 truncate">
          {dict.dashboard.projectCode} {project.projectId}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {unreadCount > 0 && (
            <span className="inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-300">
              <MessageSquare className="size-3.5" />
              {formatMessage(dict.dashboard.newMessages, { count: unreadCount })}
            </span>
          )}
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
