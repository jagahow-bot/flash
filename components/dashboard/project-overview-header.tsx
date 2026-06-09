"use client";

import { formatIntakeStyle } from "@/lib/intake/display";
import { getSessionPriceOverviewHint } from "@/lib/project/session-schedule";
import { getAppointmentDisplay } from "@/lib/project/appointment-display";
import {
  getClientContactHint,
  getClientDisplayName,
} from "@/lib/project/client-display";
import { CancelProjectButton } from "@/components/dashboard/cancel-project-button";
import { SocialContactLinks } from "@/components/project/social-contact-links";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { getProjectStatusLabel } from "@/lib/project/status";
import { buildContactLinkItems } from "@/lib/social/contact-links";
import type { Project } from "@/types/project";
import type { User } from "@/types/user";
import { cn } from "@/lib/utils";

function OverviewField({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-base font-semibold leading-snug",
          highlight && "text-emerald-700 dark:text-emerald-400"
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function ProjectOverviewHeader({
  project,
  artistName,
  clientUser,
}: {
  project: Project;
  artistName: string | null;
  clientUser: User | null;
}) {
  const dict = useAppDictionary();
  const appointment = getAppointmentDisplay(project, dict);
  const clientName = getClientDisplayName(project, clientUser, dict.project);
  const contactHint = getClientContactHint(project.intakeForm, dict.project);
  const contactLinks = buildContactLinkItems(project.intakeForm.socialContacts);

  return (
    <section className="rounded-xl border border-border/80 bg-card shadow-sm">
      <div className="border-b border-border/60 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{dict.dashboard.worksheetLabel}</p>
            <h1 className="mt-1 text-xl font-bold sm:text-2xl">
              {project.intakeForm.placement}
              <span className="font-normal text-muted-foreground">
                {" "}
                · {formatIntakeStyle(project.intakeForm.style, dict) ?? project.intakeForm.style}
              </span>
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
              {getProjectStatusLabel(project.status, dict)}
            </span>
            <CancelProjectButton project={project} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 px-5 py-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {dict.dashboard.clientLabel}
          </p>
          <p className="mt-1 text-base font-semibold leading-snug">{clientName}</p>
          {contactHint ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {contactHint}
            </p>
          ) : null}
          {contactLinks.length > 0 ? (
            <SocialContactLinks
              items={contactLinks}
              size="sm"
              className="mt-2"
            />
          ) : null}
        </div>
        <OverviewField
          label={dict.dashboard.artist}
          value={artistName ?? dict.dashboard.notAssignedYet}
          hint={artistName ? undefined : dict.dashboard.assignArtistHint}
        />
        <OverviewField
          label={dict.dashboard.appointmentTimeLabel}
          value={appointment.primary}
          hint={appointment.secondary}
          highlight={appointment.isConfirmed}
        />
        <OverviewField
          label={dict.dashboard.projectCode}
          value={project.projectId}
          hint={
            getSessionPriceOverviewHint(
              project,
              dict,
              dict.common.emptyDash,
            ) ?? undefined
          }
        />
      </div>
    </section>
  );
}
