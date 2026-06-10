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
  getClientProjectStatusDisplay,
} from "@/lib/project/client-project-display";
import { getProjectStatusStyleClass } from "@/lib/project/status-styles";
import type { Project } from "@/types/project";
import type { Studio } from "@/types/studio";
import { cn } from "@/lib/utils";

function ClientField({
  label,
  value,
  subValue,
  valueClassName,
  wrapValue = false,
}: {
  label: string;
  value: string;
  subValue?: string;
  valueClassName?: string;
  wrapValue?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-sm font-medium",
          wrapValue ? "break-words leading-snug" : "truncate",
          valueClassName,
        )}
      >
        {value}
      </p>
      {subValue ? (
        <p
          className={cn(
            "mt-0.5 text-xs text-muted-foreground",
            wrapValue ? "break-words leading-snug" : "truncate",
          )}
        >
          {subValue}
        </p>
      ) : null}
    </div>
  );
}

export function ClientProjectCard({
  project,
  studioName,
  studioSlug,
  studio,
  unreadCount = 0,
}: {
  project: Project;
  studioName: string;
  studioSlug: string;
  studio?: Studio | null;
  unreadCount?: number;
}) {
  const dict = useAppDictionary();
  const intake = project.intakeForm;
  const appointment = getAppointmentDisplay(project, dict);
  const description = getClientProjectDescription(project);
  const status = getClientProjectStatusDisplay(project, dict, studio ?? undefined);
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
      key: "appointment",
      label: dict.clientPortal.nextAppointment,
      value: appointment.primary,
      subValue: appointment.secondary,
      valueClassName: appointment.isConfirmed
        ? "text-emerald-700 dark:text-emerald-300"
        : undefined,
      wrapValue: true,
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
      <div className="flex w-full items-start justify-end">
        <span
          className={cn(
            "inline-flex max-w-full flex-col rounded-lg px-2.5 py-1 text-xs font-medium leading-snug",
            getProjectStatusStyleClass(status.styleKey, project.status),
          )}
        >
          <span className="break-words">{status.primary}</span>
          {status.secondary ? (
            <span className="mt-0.5 break-words text-[11px] font-normal opacity-90">
              {status.secondary}
            </span>
          ) : null}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
        {fields.map((field) => (
          <ClientField
            key={field.key}
            label={field.label}
            value={field.value}
            subValue={"subValue" in field ? field.subValue : undefined}
            valueClassName={
              "valueClassName" in field ? field.valueClassName : undefined
            }
            wrapValue={"wrapValue" in field ? field.wrapValue : false}
          />
        ))}
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
