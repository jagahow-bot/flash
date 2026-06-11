"use client";

import { useEffect, useState } from "react";
import { IntakeForm } from "@/components/intake/intake-form";
import { UnifiedBookingForm } from "@/components/intake/unified-booking-form";
import type { Studio } from "@/types/studio";

interface BookingFlowProps {
  studio: Studio;
}

export function BookingFlow({ studio }: BookingFlowProps) {
  const flashEnabled = studio.flashBookingEnabled === true;
  const [hasFlashDesigns, setHasFlashDesigns] = useState(false);
  const [isCheckingFlash, setIsCheckingFlash] = useState(flashEnabled);

  useEffect(() => {
    if (!flashEnabled) return;

    let cancelled = false;

    async function checkFlashDesigns() {
      try {
        const response = await fetch(`/api/studio/${studio.slug}/flash-designs`);
        const data = await response.json();
        if (!cancelled) {
          setHasFlashDesigns((data.designs ?? []).length > 0);
        }
      } catch {
        if (!cancelled) {
          setHasFlashDesigns(false);
        }
      } finally {
        if (!cancelled) {
          setIsCheckingFlash(false);
        }
      }
    }

    void checkFlashDesigns();
    return () => {
      cancelled = true;
    };
  }, [flashEnabled, studio.slug]);

  const showTabs = flashEnabled && hasFlashDesigns && !isCheckingFlash;

  if (!showTabs) {
    return <IntakeForm studio={studio} />;
  }

  return <UnifiedBookingForm studio={studio} />;
}
