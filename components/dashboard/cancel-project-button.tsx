"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types/project";

export function CancelProjectButton({ project }: { project: Project }) {
  const dict = useAppDictionary();
  const d = dict.dashboard;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (project.status === "completed" || project.status === "cancelled") {
    return null;
  }

  async function handleCancel() {
    if (!window.confirm(d.cancelProjectConfirm)) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/projects/${project.projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelBooking: true }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? d.cancelProjectFailed);
        return;
      }

      router.refresh();
    } catch {
      setError(d.cancelProjectFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={isSubmitting}
        onClick={handleCancel}
      >
        {isSubmitting ? dict.common.processing : d.cancelProjectButton}
      </Button>
      {error ? (
        <p className="max-w-xs text-right text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
