"use client";

import { useMemo, useState } from "react";
import { ActionInbox } from "@/components/dashboard/action-inbox";
import { SchedulePanel } from "@/components/dashboard/schedule-panel";
import { useAppDictionary } from "@/components/providers/locale-provider";
import type { Artist } from "@/types/artist";
import type { Project } from "@/types/project";
import type { Studio } from "@/types/studio";
import type { StudioClosure } from "@/types/studio-closure";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const FILTER_ALL = "all";
const FILTER_UNASSIGNED = "unassigned";

interface DashboardWorkspaceProps {
  projects: Project[];
  artists: Artist[];
  studio?: Studio;
  closures?: StudioClosure[];
  canFilterArtists: boolean;
  defaultArtistFilter?: string;
  unreadDiscussionCounts?: Record<string, number>;
}

function filterProjectsByArtist(
  projects: Project[],
  artistFilter: string
): Project[] {
  if (artistFilter === FILTER_ALL) {
    return projects;
  }

  if (artistFilter === FILTER_UNASSIGNED) {
    return projects.filter((project) => !project.artistId);
  }

  return projects.filter((project) => project.artistId === artistFilter);
}

export function DashboardWorkspace({
  projects,
  artists,
  studio,
  closures = [],
  canFilterArtists,
  defaultArtistFilter = FILTER_ALL,
  unreadDiscussionCounts = {},
}: DashboardWorkspaceProps) {
  const dict = useAppDictionary();
  const d = dict.dashboard;
  const [artistFilter, setArtistFilter] = useState(
    defaultArtistFilter ?? FILTER_ALL
  );

  const activeArtists = useMemo(
    () => artists.filter((artist) => artist.isActive),
    [artists]
  );

  const filteredProjects = useMemo(
    () => filterProjectsByArtist(projects, artistFilter),
    [projects, artistFilter]
  );

  const filterLabel = useMemo(() => {
    if (artistFilter === FILTER_ALL) return d.allArtists;
    if (artistFilter === FILTER_UNASSIGNED) return d.unassigned;
    return (
      activeArtists.find((artist) => artist.artistId === artistFilter)
        ?.displayName ?? d.artist
    );
  }, [artistFilter, activeArtists, d.allArtists, d.unassigned, d.artist]);

  return (
    <div className="flex flex-col gap-6">
      {canFilterArtists && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {d.currentlyShowing}
            <span className="font-medium text-foreground">{filterLabel}</span>
          </p>
          <div className="flex items-center gap-2">
            <Label htmlFor="dashboard-artist-filter" className="shrink-0 text-sm">
              {d.artist}
            </Label>
            <select
              id="dashboard-artist-filter"
              value={artistFilter}
              onChange={(event) => setArtistFilter(event.target.value)}
              className={cn(
                "h-8 min-w-[10rem] rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              )}
            >
              <option value={FILTER_ALL}>{d.all}</option>
              <option value={FILTER_UNASSIGNED}>{d.unassigned}</option>
              {activeArtists.map((artist) => (
                <option key={artist.artistId} value={artist.artistId}>
                  {artist.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <ActionInbox
            projects={filteredProjects}
            artists={artists}
            studio={studio}
            unreadDiscussionCounts={unreadDiscussionCounts}
          />
        </div>
        <div className="min-w-0">
          <SchedulePanel
            projects={filteredProjects}
            artists={artists}
            closures={closures}
          />
        </div>
      </div>
    </div>
  );
}
