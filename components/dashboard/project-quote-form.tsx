"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { SessionSlotCalendar } from "@/components/dashboard/session-slot-calendar";
import { formatMessage } from "@/lib/i18n/format";
import { getArtistOperatingHours } from "@/lib/artists/hours";
import { filterValidSelectedSlots, getBookedSlotsFromProjects } from "@/lib/availability/schedule";
import { getEffectiveOperatingHours } from "@/lib/availability/slots";
import {
  getCurrentSessionIndex,
  getCurrentSessionPricing,
  getSessionBookingTitle,
  getSessionDepositFieldLabel,
  getSessionPriceFieldLabel,
  getSessionProgressLabel,
  getSessionQuoteHelperText,
  hasMoreSessionsToBook,
} from "@/lib/project/session-schedule";
import type { Artist } from "@/types/artist";
import type { Project, ProjectStatus } from "@/types/project";
import type { Studio } from "@/types/studio";
import type { TimeSlot } from "@/types/session-details";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function slotToPayload(slot: TimeSlot) {
  return {
    startTime: slot.startTime.toISOString(),
    endTime: slot.endTime.toISOString(),
  };
}

function reviveProjectDates(project: Project): Project {
  const slot = project.confirmedTimeSlot;
  const proposed = project.proposedTimeSlots?.map((item) => ({
    startTime: new Date(item.startTime),
    endTime: new Date(item.endTime),
  }));

  return {
    ...project,
    proposedTimeSlots: proposed,
    confirmedTimeSlot: slot
      ? {
          startTime: new Date(slot.startTime),
          endTime: new Date(slot.endTime),
        }
      : undefined,
  };
}

interface ProjectQuoteFormProps {
  project: Project;
  studio: Studio;
  artists: Artist[];
  studioProjects: Project[];
  canAssignArtist: boolean;
  lockedArtistId?: string;
}

export function ProjectQuoteForm({
  project,
  studio,
  artists,
  studioProjects,
  canAssignArtist,
  lockedArtistId,
}: ProjectQuoteFormProps) {
  const dict = useAppDictionary();
  const q = dict.quote;
  const err = dict.errors;
  const c = dict.common;
  const d = dict.dashboard;
  const router = useRouter();
  const activeArtists = useMemo(
    () => artists.filter((artist) => artist.isActive),
    [artists]
  );

  const defaultArtistId =
    lockedArtistId ||
    project.artistId ||
    activeArtists[0]?.artistId ||
    "";

  const [artistId, setArtistId] = useState(defaultArtistId);
  const [sessions, setSessions] = useState(
    String(project.sessionDetails?.sessions ?? 1)
  );
  const [hoursPerSession, setHoursPerSession] = useState(
    String(project.sessionDetails?.hoursPerSession ?? 3)
  );
  const initialPricing = getCurrentSessionPricing(project);
  const [totalPrice, setTotalPrice] = useState(
    String(initialPricing?.totalPrice ?? "")
  );
  const [depositRequired, setDepositRequired] = useState(
    String(initialPricing?.depositRequired ?? "")
  );
  const [privateNotes, setPrivateNotes] = useState(project.privateNotes);
  const [proposedSlots, setProposedSlots] = useState<TimeSlot[]>(
    project.proposedTimeSlots ?? []
  );
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>(
    project.status
  );
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedArtist = useMemo(
    () => activeArtists.find((artist) => artist.artistId === artistId) ?? null,
    [activeArtists, artistId]
  );

  const operatingHours = useMemo(() => {
    if (!selectedArtist) return studio.operatingHours;
    return getArtistOperatingHours(selectedArtist, studio);
  }, [selectedArtist, studio]);

  const effectiveHours = useMemo(
    () => getEffectiveOperatingHours(operatingHours),
    [operatingHours]
  );

  const occupiedSlots = useMemo(() => {
    const others = studioProjects
      .filter((item) => item.projectId !== project.projectId)
      .map(reviveProjectDates);

    return getBookedSlotsFromProjects(others, artistId || undefined);
  }, [studioProjects, project.projectId, artistId]);

  useEffect(() => {
    setProjectStatus(project.status);
  }, [project.status]);

  useEffect(() => {
    const pricing = getCurrentSessionPricing(project);
    setTotalPrice(String(pricing?.totalPrice ?? ""));
    setDepositRequired(String(pricing?.depositRequired ?? ""));
  }, [
    project.projectId,
    project.status,
    project.currentSessionIndex,
    project.sessionDetails?.totalPrice,
    project.sessionDetails?.depositRequired,
    project.sessionDetails?.pricedSessionIndex,
  ]);

  const sessionCount = Math.max(1, Number(sessions) || 1);
  const sessionHours = Math.max(1, Number(hoursPerSession) || 1);
  const currentSessionIndex = getCurrentSessionIndex(project);
  const sessionLabelOptions = {
    sessionCountOverride: sessionCount,
    currentSessionIndexOverride: currentSessionIndex,
  };
  const sessionQuoteHelperText = getSessionQuoteHelperText(
    project,
    dict.project,
    sessionLabelOptions,
  );

  useEffect(() => {
    setProposedSlots((current) =>
      filterValidSelectedSlots(
        current,
        sessionHours,
        effectiveHours,
        occupiedSlots,
        studio.closures
      )
    );
  }, [sessionHours, effectiveHours, occupiedSlots, studio.closures]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!artistId) {
      setError(q.selectArtistRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      const quoteOnly = proposedSlots.length === 0;
      const response = await fetch(`/api/projects/${project.projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId,
          sessionDetails: {
            sessions: Number(sessions),
            hoursPerSession: sessionHours,
            totalPrice: Number(totalPrice),
            depositRequired: Number(depositRequired),
          },
          proposedTimeSlots: proposedSlots.map(slotToPayload),
          currentSessionIndex: getCurrentSessionIndex(project),
          privateNotes,
          ...(quoteOnly ? { quoteOnly: true } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? err.saveFailed);
        return;
      }

      const nextStatus = (data.status ?? projectStatus) as ProjectStatus;
      const sessionIndex = getCurrentSessionIndex(project);
      setProjectStatus(nextStatus);
      setSuccessMessage(
        quoteOnly
          ? q.savedQuoteDiscuss
          : nextStatus === "pending_payment"
            ? formatMessage(q.sentSessionSlots, { index: sessionIndex })
            : q.savedQuoteAndSlots
      );
      router.refresh();
    } catch {
      setError(err.saveFailedRetry);
    } finally {
      setIsSubmitting(false);
    }
  }

  const canScheduleNextSession =
    hasMoreSessionsToBook(project) && getCurrentSessionIndex(project) > 1;

  const readOnly =
    projectStatus === "deposit_submitted" ||
    (projectStatus === "booked" && !canScheduleNextSession) ||
    projectStatus === "completed";

  const submitLabel =
    proposedSlots.length === 0
      ? q.saveQuoteOnly
      : projectStatus === "pending_payment"
        ? formatMessage(q.updateSessionSlots, {
            index: getCurrentSessionIndex(project),
          })
        : formatMessage(q.sendSessionSlots, {
            index: getCurrentSessionIndex(project),
          });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{q.title}</CardTitle>
        <CardDescription>
          {sessionCount > 1
            ? formatMessage(q.multiSessionDescription, {
                count: sessionCount,
                index: currentSessionIndex,
              })
            : projectStatus === "pending_payment"
              ? q.awaitingClientDescription
              : q.defaultDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {getSessionProgressLabel(project, dict.project) ? (
            <p className="text-sm font-medium">
              {getSessionBookingTitle(project, dict.project)}
            </p>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="artistId">{q.assignedArtistLabel}</Label>
            {canAssignArtist ? (
              <select
                id="artistId"
                value={artistId}
                disabled={readOnly || activeArtists.length === 0}
                onChange={(event) => setArtistId(event.target.value)}
                className={cn(
                  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
                )}
              >
                {activeArtists.length === 0 ? (
                  <option value="">{q.noArtistsOption}</option>
                ) : (
                  activeArtists.map((artist) => (
                    <option key={artist.artistId} value={artist.artistId}>
                      {artist.displayName}
                      {artist.styles.length > 0
                        ? ` · ${artist.styles.join("、")}`
                        : ""}
                    </option>
                  ))
                )}
              </select>
            ) : (
              <p className="text-sm">
                {selectedArtist?.displayName ?? d.unassigned}
              </p>
            )}
            {selectedArtist?.bio && (
              <p className="text-xs text-muted-foreground">
                {selectedArtist.bio}
              </p>
            )}
          </div>

          {sessionQuoteHelperText ? (
            <p className="text-sm text-muted-foreground">
              {sessionQuoteHelperText}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="sessions">{dict.project.sessions}</Label>
              <Input
                id="sessions"
                type="number"
                min={1}
                value={sessions}
                disabled={readOnly}
                onChange={(event) => setSessions(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="hoursPerSession">{q.hoursPerSessionLabel}</Label>
              <Input
                id="hoursPerSession"
                type="number"
                min={1}
                max={8}
                value={hoursPerSession}
                disabled={readOnly}
                onChange={(event) => setHoursPerSession(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="totalPrice">
                {getSessionPriceFieldLabel(
                  project,
                  dict.project,
                  sessionLabelOptions,
                )}
              </Label>
              <Input
                id="totalPrice"
                type="number"
                min={0}
                value={totalPrice}
                disabled={readOnly}
                onChange={(event) => setTotalPrice(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="depositRequired">
                {getSessionDepositFieldLabel(
                  project,
                  dict.project,
                  sessionLabelOptions,
                )}
              </Label>
              <Input
                id="depositRequired"
                type="number"
                min={0}
                value={depositRequired}
                disabled={readOnly}
                onChange={(event) => setDepositRequired(event.target.value)}
              />
            </div>
          </div>

          <SessionSlotCalendar
            operatingHours={operatingHours}
            sessions={sessionCount}
            hoursPerSession={sessionHours}
            occupiedSlots={occupiedSlots}
            clientAvailability={project.intakeForm.availability}
            closures={studio.closures}
            value={proposedSlots}
            onChange={setProposedSlots}
            readOnly={readOnly}
          />

          <div className="flex flex-col gap-2">
            <Label htmlFor="privateNotes">{q.privateNotesLabel}</Label>
            <Textarea
              id="privateNotes"
              rows={3}
              value={privateNotes}
              disabled={readOnly}
              onChange={(event) => setPrivateNotes(event.target.value)}
              placeholder={q.privateNotesPlaceholder}
            />
          </div>

          {successMessage && (
            <p
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100"
              role="status"
            >
              {successMessage}
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          {!readOnly && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? c.saving : submitLabel}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
