"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { formatMessage } from "@/lib/i18n/format";
import { formatTimeSlot } from "@/lib/project/format";
import type { TimeSlot } from "@/types/session-details";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ClientSlotPicker({
  projectId,
  studioSlug,
  slots,
  sessionIndex = 1,
  totalSessions = 1,
  bookingTitle,
}: {
  projectId: string;
  studioSlug: string;
  slots: TimeSlot[];
  sessionIndex?: number;
  totalSessions?: number;
  bookingTitle?: string;
}) {
  const dict = useAppDictionary();
  const p = dict.project;
  const c = dict.common;
  const title =
    bookingTitle ??
    (totalSessions > 1
      ? formatMessage(p.bookingSlotMulti, {
          index: sessionIndex,
          total: totalSessions,
        })
      : p.bookingSlotTitle);
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    if (selectedIndex === null) {
      setError(p.selectSlotFirst);
      return;
    }

    const slot = slots[selectedIndex];
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studioSlug,
          confirmedTimeSlot: {
            startTime: slot.startTime.toISOString(),
            endTime: slot.endTime.toISOString(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? p.submitFailed);
        return;
      }

      router.refresh();
    } catch {
      setError(p.submitFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium">{title}</p>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">{p.pickSlotTitle}</p>
        <div className="flex flex-col gap-2">
          {slots.map((slot, index) => (
            <button
              key={`${slot.startTime.toISOString()}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                selectedIndex === index
                  ? "border-primary bg-primary/10"
                  : "hover:bg-background/60"
              )}
            >
              {formatTimeSlot(slot, dict.dates)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button
        type="button"
        size="sm"
        className="w-fit"
        disabled={isSubmitting}
        onClick={handleConfirm}
      >
        {isSubmitting ? c.submitting : p.confirmSlot}
      </Button>
    </div>
  );
}
