"use client";

import Image from "next/image";
import { useState } from "react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { formatMessage } from "@/lib/i18n/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getSketchVersionNumber,
  isLegacySketchDate,
  sortSketchRecordsChronological,
  sortSketchRecordsNewestFirst,
} from "@/lib/project/sketch-records";
import { formatMonthDay } from "@/lib/project/format";
import type { AppDictionary } from "@/lib/i18n/app-types";
import type { ProjectSketchRecord } from "@/types/project-sketch";
import { cn } from "@/lib/utils";

function formatSketchDate(
  date: Date,
  dates: AppDictionary["dates"],
): string | null {
  if (isLegacySketchDate(date)) {
    return null;
  }
  return formatMonthDay(date, dates, { weekday: true });
}

export function SketchTimeline({
  records,
  title,
  emptyHint,
  mode = "client",
  onUpdateNote,
  embedded = false,
}: {
  records: ProjectSketchRecord[];
  title?: string;
  emptyHint?: string;
  mode?: "client" | "studio";
  onUpdateNote?: (id: string, note: string) => Promise<void>;
  /** Hides section title and tightens spacing when parent renders the header */
  embedded?: boolean;
}) {
  const dict = useAppDictionary();
  const p = dict.project;
  const a = dict.assets;
  const c = dict.common;
  const resolvedTitle = title ?? p.sketchHistory;

  if (records.length === 0) {
    if (!emptyHint) return null;

    return (
      <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyHint}
      </div>
    );
  }

  const chronological = sortSketchRecordsChronological(records);
  const displayRecords = sortSketchRecordsNewestFirst(records);
  const isClientView = mode === "client";

  return (
    <div className={cn("flex flex-col", embedded ? "gap-2" : "gap-3")}>
      {!embedded && <p className="font-medium">{resolvedTitle}</p>}
      <ol className="relative flex flex-col gap-0">
        {displayRecords.map((record, index) => {
          const version = getSketchVersionNumber(record, chronological);
          const dateLabel = formatSketchDate(record.uploadedAt, dict.dates);
          const isLatest = index === 0;

          return (
            <li
              key={record.id}
              className={cn(
                "relative flex gap-3 last:pb-0",
                embedded ? "pb-3" : "pb-5"
              )}
            >
              {index < displayRecords.length - 1 && (
                <span
                  className={cn(
                    "absolute bottom-0 w-px bg-border",
                    isClientView
                      ? "left-[39px] top-20 sm:left-[55px] sm:top-28"
                      : "left-[27px] top-14"
                  )}
                  aria-hidden
                />
              )}
              <div className="relative z-10 shrink-0">
                <a
                  href={record.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "relative block overflow-hidden rounded-lg border bg-muted transition-opacity hover:opacity-90",
                    isClientView ? "size-20 sm:size-28" : "size-14"
                  )}
                >
                  <Image
                    src={record.url}
                    alt={formatMessage(p.versionLabel, { version })}
                    fill
                    className="object-cover"
                    sizes={isClientView ? "112px" : "56px"}
                  />
                </a>
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      isLatest
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {formatMessage(p.versionLabel, { version })}
                  </span>
                  {dateLabel && (
                    <span className="text-xs text-muted-foreground">
                      {dateLabel}
                    </span>
                  )}
                  {record.sessionIndex !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {formatMessage(a.sessionBadge, {
                        index: record.sessionIndex,
                      })}
                    </span>
                  )}
                </div>
                {mode === "studio" && onUpdateNote ? (
                  <SketchNoteEditor
                    record={record}
                    onSave={onUpdateNote}
                  />
                ) : record.note ? (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {a.noteColon}
                    </span>
                    {record.note}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SketchNoteEditor({
  record,
  onSave,
}: {
  record: ProjectSketchRecord;
  onSave: (id: string, note: string) => Promise<void>;
}) {
  const dict = useAppDictionary();
  const a = dict.assets;
  const c = dict.common;
  const [draft, setDraft] = useState(record.note ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(!record.note);

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave(record.id, draft);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  if (!isEditing && record.note) {
    return (
      <div className="mt-1.5">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{a.noteColon}</span>
          {record.note}
        </p>
        <Button
          type="button"
          variant="link"
          className="h-auto px-0 text-xs"
          onClick={() => {
            setDraft(record.note ?? "");
            setIsEditing(true);
          }}
        >
          {a.editNote}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <Label htmlFor={`sketch-note-${record.id}`} className="text-xs">
        {a.noteLabel}
      </Label>
      <div className="flex gap-2">
        <Input
          id={`sketch-note-${record.id}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={120}
          placeholder={a.notePlaceholder}
          className="h-8 text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSaving}
          onClick={handleSave}
        >
          {isSaving ? c.saving : c.save}
        </Button>
      </div>
    </div>
  );
}
