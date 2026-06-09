"use client";

import { useState } from "react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StudioClosure } from "@/types/studio-closure";
import { Trash2 } from "lucide-react";

interface StudioClosuresEditorProps {
  value: StudioClosure[];
  onChange: (value: StudioClosure[]) => void;
}

export function StudioClosuresEditor({
  value,
  onChange,
}: StudioClosuresEditorProps) {
  const dict = useAppDictionary();
  const s = dict.settings;
  const c = dict.common;
  const [date, setDate] = useState("");
  const [label, setLabel] = useState("");

  const addClosure = () => {
    if (!date) return;

    if (value.some((closure) => closure.date === date)) {
      onChange(
        value.map((closure) =>
          closure.date === date
            ? { date, label: label.trim() || undefined }
            : closure
        )
      );
    } else {
      onChange(
        [...value, { date, label: label.trim() || undefined }].sort((a, b) =>
          a.date.localeCompare(b.date)
        )
      );
    }

    setDate("");
    setLabel("");
  };

  const removeClosure = (targetDate: string) => {
    onChange(value.filter((closure) => closure.date !== targetDate));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {s.closuresEditorDescription}
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="closure-date">{s.closureDateLabel}</Label>
          <Input
            id="closure-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-[180px]"
          />
        </div>
        <div className="min-w-[200px] flex-1 space-y-1.5">
          <Label htmlFor="closure-label">{s.closureLabelOptional}</Label>
          <Input
            id="closure-label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder={s.closureLabelPlaceholder}
          />
        </div>
        <Button type="button" variant="secondary" onClick={addClosure} disabled={!date}>
          {s.addClosure}
        </Button>
      </div>

      {value.length > 0 ? (
        <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
          {value.map((closure) => (
            <li
              key={closure.date}
              className="flex items-center justify-between gap-3 px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-medium">{closure.date}</p>
                {closure.label ? (
                  <p className="text-xs text-muted-foreground">{closure.label}</p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeClosure(closure.date)}
                aria-label={`${c.removeAria} ${closure.date}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{s.noClosures}</p>
      )}
    </div>
  );
}
