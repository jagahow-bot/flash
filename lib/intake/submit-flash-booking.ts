import { compressImage } from "@/lib/storage/compress-image";
import { uploadIntakeImage } from "@/lib/storage/upload-intake-image";
import { buildSocialContacts } from "@/lib/validations/intake-form";
import type { FlashBookingValues } from "@/lib/validations/flash-booking";

export function isFlashBookingStorageError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("storage/unauthorized") ||
    message.includes("storage/") ||
    message.includes("Firebase Storage")
  );
}

export function resolveFlashBookingSubmitError(
  error: unknown,
  messages: {
    submitFailed: string;
    uploadFailed: string;
    uploadFailedRetry: string;
  }
): string {
  if (isFlashBookingStorageError(error)) {
    return messages.uploadFailedRetry;
  }

  const message = error instanceof Error ? error.message : "";
  if (message === "submit failed") {
    return messages.submitFailed;
  }
  if (message) {
    return message;
  }

  return messages.uploadFailed;
}

export interface SubmitFlashBookingInput {
  studioSlug: string;
  studioId: string;
  values: FlashBookingValues;
  placementFile?: File;
  /** Shown budget string; server resolves authoritative price from flashDesignId. */
  displayPrice: number;
  /** Localized style label (e.g. 認領圖, Flash design). */
  intakeStyle: string;
  /** Localized default description for flash intake. */
  intakeDescription: string;
}

export interface SubmitFlashBookingResult {
  projectId: string;
}

/**
 * Flash booking never uploads design images. Optional placement photos go to
 * `studios/{studioId}/intake/` via /api/intake/upload. Design imageUrl is
 * resolved server-side from flashDesignId in /api/intake.
 */
export async function submitFlashBooking(
  input: SubmitFlashBookingInput
): Promise<SubmitFlashBookingResult> {
  const {
    studioSlug,
    studioId,
    values,
    placementFile,
    displayPrice,
    intakeStyle,
    intakeDescription,
  } = input;

  let placementPhotoUrl: string | undefined;

  if (placementFile) {
    try {
      const compressed = await compressImage(placementFile);
      placementPhotoUrl = await uploadIntakeImage(
        studioId,
        compressed,
        "placement"
      );
    } catch (error) {
      console.warn(
        "Flash booking placement photo upload failed; submitting without photo:",
        error
      );
    }
  }

  const intakeForm = {
    bookingType: "flash" as const,
    flashDesignId: values.flashDesignId,
    placement: values.placement,
    size: values.size,
    style: intakeStyle,
    description: intakeDescription,
    isCoverUp: false,
    budget: String(displayPrice),
    availability: values.availability,
    notes: values.notes,
    socialContacts: buildSocialContacts(values),
    placementPhotoUrl,
  };

  const response = await fetch("/api/intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studioSlug, intakeForm }),
  });

  const data = (await response.json()) as { projectId?: string; error?: string };

  if (!response.ok || !data.projectId) {
    throw new Error(data.error ?? "submit failed");
  }

  return { projectId: data.projectId };
}
