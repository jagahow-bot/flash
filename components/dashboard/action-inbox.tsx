"use client";

import { useMemo, useState } from "react";
import { ProjectInboxCard } from "@/components/dashboard/project-inbox-card";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { formatMessage } from "@/lib/i18n/format";
import { buildArtistNameMap } from "@/lib/artists/lookup";
import {
  compareInboxProjects,
  compareInboxProjectsByBookingId,
  matchesInboxStatusFilter,
  shouldShowInTaskInbox,
  type InboxSortMode,
  type InboxStatusFilter,
} from "@/lib/project/inbox-eligibility";
import type { Project, ProjectStatus } from "@/types/project";
import type { Artist } from "@/types/artist";
import type { Studio } from "@/types/studio";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const INBOX_STATUS_FILTERS: InboxStatusFilter[] = [
  "all",
  "pending_brief",
  "quoting",
  "pending_payment",
  "deposit_submitted",
  "booked",
  "awaitingAssets",
  "awaitingSession",
  "awaitingSignature",
  "awaitingDeposit",
  "awaitingQuote",
];

function getFilterLabel(
  filter: InboxStatusFilter,
  dict: ReturnType<typeof useAppDictionary>
): string {
  const d = dict.dashboard;
  if (filter === "all") return d.all;

  if (
    filter === "awaitingAssets" ||
    filter === "awaitingSession" ||
    filter === "awaitingSignature" ||
    filter === "awaitingDeposit" ||
    filter === "awaitingQuote"
  ) {
    return dict.status.inbox[filter];
  }

  return dict.status.studio[filter as ProjectStatus];
}

export function ActionInbox({
  projects,
  artists,
  studio,
  unreadDiscussionCounts = {},
}: {
  projects: Project[];
  artists: Artist[];
  studio?: Studio;
  unreadDiscussionCounts?: Record<string, number>;
}) {
  const dict = useAppDictionary();
  const d = dict.dashboard;
  const artistNames = buildArtistNameMap(artists);
  const [sortMode, setSortMode] = useState<InboxSortMode>("priority");
  const [statusFilter, setStatusFilter] = useState<InboxStatusFilter>("all");

  const inboxProjects = useMemo(() => {
    return projects
      .filter((project) =>
        shouldShowInTaskInbox(project, {
          studio,
          unreadDiscussionCount:
            unreadDiscussionCounts[project.projectId] ?? 0,
        })
      )
      .filter((project) =>
        matchesInboxStatusFilter(project, statusFilter, studio)
      )
      .sort((a, b) =>
        sortMode === "bookingId"
          ? compareInboxProjectsByBookingId(a, b)
          : compareInboxProjects(a, b, { studio, unreadDiscussionCounts })
      );
  }, [projects, studio, unreadDiscussionCounts, statusFilter, sortMode]);

  const totalUnread = inboxProjects.reduce(
    (sum, project) => sum + (unreadDiscussionCounts[project.projectId] ?? 0),
    0
  );

  const selectClassName = cn(
    "h-8 min-w-[8.5rem] rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
  );

  return (
    <Card className="h-full">
      <CardHeader className="gap-4">
        <div>
          <CardTitle>{d.actionInbox}</CardTitle>
          <CardDescription>
            {totalUnread > 0
              ? formatMessage(d.newMessages, { count: totalUnread })
              : null}
            {totalUnread > 0 ? " · " : null}
            {d.inboxDescription}
          </CardDescription>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inbox-sort" className="text-xs">
              {d.inboxSortLabel}
            </Label>
            <select
              id="inbox-sort"
              value={sortMode}
              onChange={(event) =>
                setSortMode(event.target.value as InboxSortMode)
              }
              className={selectClassName}
            >
              <option value="priority">{d.inboxSortPriority}</option>
              <option value="bookingId">{d.inboxSortBookingId}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inbox-status-filter" className="text-xs">
              {d.inboxFilterStatus}
            </Label>
            <select
              id="inbox-status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as InboxStatusFilter)
              }
              className={selectClassName}
            >
              {INBOX_STATUS_FILTERS.map((filter) => (
                <option key={filter} value={filter}>
                  {getFilterLabel(filter, dict)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {inboxProjects.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {d.inboxEmpty}
          </p>
        ) : (
          inboxProjects.map((project) => (
            <ProjectInboxCard
              key={project.projectId}
              project={project}
              studio={studio}
              artistName={artistNames.get(project.artistId) ?? null}
              unreadDiscussionCount={
                unreadDiscussionCounts[project.projectId] ?? 0
              }
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
