"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { WeeklyScheduleEditor } from "@/components/settings/weekly-schedule-editor";
import { formatMessage } from "@/lib/i18n/format";
import {
  isWeeklyScheduleValid,
  normalizeWeeklySchedule,
} from "@/lib/availability/weekly-schedule";
import type { Artist } from "@/types/artist";
import type { Studio } from "@/types/studio";
import type { StudioWeeklySchedule } from "@/types/operating-hours";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

function parseStyles(value: string): string[] {
  return value
    .split(/[,、，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatStyles(styles: string[]): string {
  return styles.join("、");
}

type ArtistSaveResult = {
  temporaryPassword?: string;
};

interface ArtistEditorProps {
  artist?: Artist;
  studio: Studio;
  adminEmail?: string;
  soloMode?: boolean;
  onCancel?: () => void;
  onSaved: (result?: ArtistSaveResult) => void;
}

function ArtistEditor({
  artist,
  studio,
  adminEmail,
  soloMode = false,
  onCancel,
  onSaved,
}: ArtistEditorProps) {
  const dict = useAppDictionary();
  const ar = dict.artists;
  const err = dict.errors;
  const c = dict.common;
  const isNew = !artist;
  const [displayName, setDisplayName] = useState(artist?.displayName ?? "");
  const [stylesText, setStylesText] = useState(formatStyles(artist?.styles ?? []));
  const [bio, setBio] = useState(artist?.bio ?? "");
  const [userEmail, setUserEmail] = useState(artist?.userEmail ?? "");
  const [isActive, setIsActive] = useState(artist?.isActive ?? true);
  const [useCustomHours, setUseCustomHours] = useState(
    Boolean(artist?.weeklySchedule && Object.keys(artist.weeklySchedule).length > 0)
  );
  const [weeklySchedule, setWeeklySchedule] = useState<StudioWeeklySchedule>(
    normalizeWeeklySchedule(artist?.weeklySchedule ?? studio.weeklySchedule)
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!soloMode && useCustomHours && !isWeeklyScheduleValid(weeklySchedule)) {
      setError(err.invalidArtistHours);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      displayName,
      styles: parseStyles(stylesText),
      bio,
      userEmail: userEmail.trim() || undefined,
      isActive,
      weeklySchedule: soloMode || !useCustomHours ? null : weeklySchedule,
    };

    try {
      const response = await fetch(
        isNew ? "/api/studio/artists" : `/api/studio/artists/${artist.artistId}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? err.saveFailed);
        return;
      }

      onSaved(
        data.temporaryPassword
          ? { temporaryPassword: data.temporaryPassword }
          : undefined
      );
    } catch {
      setError(err.saveFailedRetry);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`name-${artist?.artistId ?? "new"}`}>
            {ar.displayNameLabel}
          </Label>
          <Input
            id={`name-${artist?.artistId ?? "new"}`}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`styles-${artist?.artistId ?? "new"}`}>
            {ar.stylesLabel}
          </Label>
          <Input
            id={`styles-${artist?.artistId ?? "new"}`}
            value={stylesText}
            onChange={(event) => setStylesText(event.target.value)}
            placeholder={ar.stylesPlaceholder}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`bio-${artist?.artistId ?? "new"}`}>{ar.bioLabel}</Label>
        <Textarea
          id={`bio-${artist?.artistId ?? "new"}`}
          rows={2}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
        />
      </div>

      <div
        className={cn(
          "flex flex-col gap-2 rounded-lg",
          soloMode && "bg-muted/30 p-3 opacity-70"
        )}
      >
        <Label htmlFor={`userEmail-${artist?.artistId ?? "new"}`}>
          {ar.bindEmailLabel}
          {soloMode ? ar.bindEmailSoloLocked : ar.bindEmailOptional}
        </Label>
        <Input
          id={`userEmail-${artist?.artistId ?? "new"}`}
          type="email"
          autoComplete="email"
          value={soloMode ? adminEmail ?? ar.useAdminAccount : userEmail}
          onChange={(event) => setUserEmail(event.target.value)}
          placeholder="artist@example.com"
          disabled={soloMode}
        />
        <p className="text-xs text-muted-foreground">
          {soloMode ? ar.soloBindHint : ar.bindEmailHint}
        </p>
      </div>

      {!isNew && !soloMode && (
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={isActive}
            onCheckedChange={(checked) => setIsActive(checked === true)}
          />
          {ar.activeToggle}
        </label>
      )}

      <label
        className={cn(
          "flex items-center gap-2 text-sm",
          soloMode && "cursor-not-allowed opacity-50"
        )}
      >
        <Checkbox
          checked={soloMode ? false : useCustomHours}
          onCheckedChange={(checked) => setUseCustomHours(checked === true)}
          disabled={soloMode}
        />
        {ar.usePersonalHours}
      </label>

      {soloMode ? (
        <p className="text-xs text-muted-foreground">{ar.soloUsesStudioHours}</p>
      ) : null}

      {!soloMode && useCustomHours && (
        <WeeklyScheduleEditor
          value={weeklySchedule}
          onChange={setWeeklySchedule}
          description={ar.personalHoursOverride}
        />
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? c.saving : isNew ? ar.addArtist : ar.saveChanges}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {c.cancel}
          </Button>
        )}
      </div>
    </form>
  );
}

export function ArtistManagement({
  studio,
  artists: initialArtists,
  adminEmail,
}: {
  studio: Studio;
  artists: Artist[];
  adminEmail?: string;
}) {
  const dict = useAppDictionary();
  const ar = dict.artists;
  const err = dict.errors;
  const c = dict.common;
  const router = useRouter();
  const [isSoloStudio, setIsSoloStudio] = useState(Boolean(studio.isSoloStudio));
  const [syncedSoloStudio, setSyncedSoloStudio] = useState(studio.isSoloStudio);
  if (studio.isSoloStudio !== syncedSoloStudio) {
    setSyncedSoloStudio(studio.isSoloStudio);
    setIsSoloStudio(Boolean(studio.isSoloStudio));
  }
  const [artists, setArtists] = useState(initialArtists);
  const [syncedInitialArtists, setSyncedInitialArtists] = useState(initialArtists);
  if (initialArtists !== syncedInitialArtists) {
    setSyncedInitialArtists(initialArtists);
    setArtists(initialArtists);
  }
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [soloError, setSoloError] = useState<string | null>(null);
  const [soloSaving, setSoloSaving] = useState(false);
  const [accountNotice, setAccountNotice] = useState<string | null>(null);
  const soloMode = isSoloStudio;

  async function handleSoloStudioChange(checked: boolean) {
    setSoloError(null);
    setSoloSaving(true);

    try {
      const response = await fetch("/api/studio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSoloStudio: checked }),
      });
      const data = await response.json();

      if (!response.ok) {
        setSoloError(data.error ?? err.updateFailed);
        return;
      }

      setIsSoloStudio(checked);
      setIsCreating(false);
      setEditingId(null);
      router.refresh();
      await refreshArtists();
    } catch {
      setSoloError(err.updateFailedRetry);
    } finally {
      setSoloSaving(false);
    }
  }

  async function refreshArtists() {
    try {
      const response = await fetch("/api/studio/artists");
      const data = await response.json();
      if (data.artists) {
        setArtists(data.artists);
      }
    } catch {
      // ignore
    }
  }

  function handleSaved(result?: ArtistSaveResult) {
    setEditingId(null);
    setIsCreating(false);

    if (result?.temporaryPassword) {
      setAccountNotice(
        formatMessage(ar.accountCreatedNotice, {
          password: result.temporaryPassword,
        })
      );
    }

    router.refresh();
    void refreshArtists();
  }

  return (
    <div className="flex flex-col gap-6">
      {accountNotice ? (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
          role="status"
        >
          {accountNotice}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{ar.studioTypeTitle}</CardTitle>
          <CardDescription>{ar.studioTypeDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <label
            className={cn(
              "flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 text-sm",
              soloSaving && "opacity-60"
            )}
          >
            <Checkbox
              checked={isSoloStudio}
              onCheckedChange={(checked) =>
                void handleSoloStudioChange(checked === true)
              }
              disabled={soloSaving}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium">{ar.soloStudioLabel}</span>
              <span className="mt-1 block text-muted-foreground">
                {ar.soloStudioHint}
              </span>
            </span>
          </label>
          {soloError ? (
            <p className="text-sm text-destructive" role="alert">
              {soloError}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{ar.artistListTitle}</CardTitle>
            <CardDescription>
              {soloMode ? ar.artistListSolo : ar.artistListTeam}
            </CardDescription>
          </div>
          {!soloMode && !isCreating && (
            <Button type="button" size="sm" onClick={() => setIsCreating(true)}>
              {ar.addArtist}
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {soloMode && (
            <p className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
              {ar.soloEnabledNotice}
            </p>
          )}

          {isCreating && !soloMode && (
            <div className="rounded-xl border border-dashed p-4">
              <p className="mb-4 text-sm font-medium">{ar.addArtist}</p>
              <ArtistEditor
                studio={studio}
                adminEmail={adminEmail}
                onCancel={() => setIsCreating(false)}
                onSaved={handleSaved}
              />
            </div>
          )}

          {artists.length === 0 && !isCreating ? (
            <p className="text-sm text-muted-foreground">
              {soloMode ? ar.creatingProfile : ar.noArtists}
            </p>
          ) : (
            artists.map((artist) => (
              <div
                key={artist.artistId}
                className="rounded-xl border p-4"
              >
                {editingId === artist.artistId ? (
                  <ArtistEditor
                    artist={artist}
                    studio={studio}
                    adminEmail={adminEmail}
                    soloMode={soloMode}
                    onCancel={() => setEditingId(null)}
                    onSaved={handleSaved}
                  />
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{artist.displayName}</p>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs",
                            artist.isActive
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {artist.isActive ? ar.active : ar.inactive}
                        </span>
                      </div>
                      {artist.styles.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {formatStyles(artist.styles)}
                        </p>
                      )}
                      {artist.bio && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {artist.bio}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {artist.userEmail
                          ? formatMessage(ar.boundEmail, { email: artist.userEmail })
                          : ar.unboundEmail}
                        {artist.weeklySchedule &&
                        Object.keys(artist.weeklySchedule).length > 0
                          ? ar.personalHoursBadge
                          : ar.studioHoursBadge}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setEditingId(artist.artistId)}
                    >
                      {c.edit}
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
