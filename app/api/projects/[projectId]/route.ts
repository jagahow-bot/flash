import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLinkedArtist } from "@/lib/artists/access";
import { requireClientUser } from "@/lib/auth/require-client";
import { requireStudioProjectAccess } from "@/lib/auth/require-studio-project";
import { getActiveProjectTimeSlot } from "@/lib/project/active-session-state";
import { canClientAccessProject } from "@/lib/project/client-access";
import { submitClientDepositProof } from "@/lib/project/client-deposit-submit.server";
import { getPersistedSessionRecords } from "@/lib/project/session-history";
import {
  clearCurrentSessionPricing,
  getCurrentSessionIndex,
  getTotalSessions,
  hasMoreSessionsToBook,
  isSessionDeliveryComplete,
  needsFreshSessionPricing,
  requiresDepositForCurrentSession,
} from "@/lib/project/session-schedule";
import { getArtistById, getArtistsByStudioId } from "@/lib/firestore/artists.server";
import {
  computeDepositDeadlineAt,
  getDepositDeadlineDays,
  shouldExpireDepositDeadline,
} from "@/lib/project/deposit-deadline";
import {
  notifyDepositConfirmed,
  notifyDepositSubmitted,
  notifySlotReserved,
  notifyProjectAssetsUploaded,
  notifyProjectCompleted,
  notifyQuoteProgressUpdate,
  notifySessionDeliveryComplete,
  proposedSlotsChanged,
  sessionDetailsChanged,
} from "@/lib/email/project-notifications.server";
import { ensurePreSessionDocumentRecords } from "@/lib/pre-session-documents/records";
import {
  appendSketchRecords,
  getSketchRecords,
  syncSketchesFromRecords,
} from "@/lib/project/sketch-records";
import {
  getProjectById,
  updateProjectFields,
} from "@/lib/firestore/projects.server";
import { getStudioById } from "@/lib/firestore/studios.server";
import type { Project, ProjectStatus } from "@/types/project";
import type { SessionRecord } from "@/types/session-record";
import type { SessionDetails, TimeSlot } from "@/types/session-details";

const timeSlotSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

const studioUpdateSchema = z.object({
  status: z
    .enum([
      "pending_brief",
      "quoting",
      "pending_payment",
      "booked",
      "completed",
    ])
    .optional(),
  sessionDetails: z
    .object({
      sessions: z.number().min(1),
      hoursPerSession: z.number().min(1),
      totalPrice: z.number().min(0),
      depositRequired: z.number().min(0),
    })
    .optional(),
  proposedTimeSlots: z.array(timeSlotSchema).optional(),
  currentSessionIndex: z.number().min(1).optional(),
  privateNotes: z.string().optional(),
  artistId: z.string().min(1).optional(),
  sketches: z.array(z.string().url()).optional(),
  appendSketchRecords: z
    .array(
      z.object({
        url: z.string().url(),
        note: z.string().max(120).optional(),
      })
    )
    .optional(),
  updateSketchNote: z
    .object({
      id: z.string().min(1),
      note: z.string().max(120),
    })
    .optional(),
  finalPhotos: z.array(z.string().url()).optional(),
  confirmDeposit: z.literal(true).optional(),
  completeSessionDelivery: z.literal(true).optional(),
  quoteOnly: z.literal(true).optional(),
  cancelBooking: z.literal(true).optional(),
});

function parseTimeSlots(
  slots: z.infer<typeof timeSlotSchema>[]
): TimeSlot[] {
  return slots.map((slot) => ({
    startTime: new Date(slot.startTime),
    endTime: new Date(slot.endTime),
  }));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const access = await requireStudioProjectAccess(projectId);

    if (!access) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const body = await request.json();
    const updates = studioUpdateSchema.parse(body);
    const project = access.project;
    const { user } = access;

    if (user.role === "artist") {
      const artists = await getArtistsByStudioId(project.studioId);
      const linked = getLinkedArtist(artists, user);
      if (
        linked &&
        project.artistId &&
        project.artistId !== linked.artistId
      ) {
        return NextResponse.json({ error: "未授權" }, { status: 403 });
      }
      if (updates.artistId && updates.artistId !== linked?.artistId) {
        return NextResponse.json({ error: "無法變更負責刺青師" }, { status: 403 });
      }
    }

    if (updates.artistId) {
      const artist = await getArtistById(updates.artistId);
      if (!artist || artist.studioId !== project.studioId || !artist.isActive) {
        return NextResponse.json({ error: "刺青師不存在或已停用" }, { status: 400 });
      }
    }

    if (updates.cancelBooking) {
      if (project.status === "completed" || project.status === "cancelled") {
        return NextResponse.json(
          { error: "此預約無法取消" },
          { status: 400 }
        );
      }

      const cancelledProject: Project = {
        ...project,
        status: "cancelled",
        cancelledAt: new Date(),
        proposedTimeSlots: [],
        confirmedTimeSlot: undefined,
        confirmedTimeSlots: undefined,
        depositDeadlineAt: undefined,
        slotSelectedAt: undefined,
        depositProofUrl: undefined,
        depositSubmittedAt: undefined,
      };

      await updateProjectFields(projectId, cancelledProject);

      return NextResponse.json({
        projectId,
        status: cancelledProject.status,
      });
    }

    if (updates.status === "completed" && project.status !== "booked") {
      return NextResponse.json(
        { error: "僅已預約的專案可標記為已完成" },
        { status: 400 }
      );
    }

    if (updates.completeSessionDelivery) {
      if (project.status !== "booked") {
        return NextResponse.json(
          { error: "僅已預約狀態可完成作品交付" },
          { status: 400 }
        );
      }

      const currentIndex = getCurrentSessionIndex(project);

      if (!hasMoreSessionsToBook(project)) {
        return NextResponse.json(
          { error: "最後一次 Session 請直接標記預約為已完成" },
          { status: 400 }
        );
      }

      if (isSessionDeliveryComplete(project, currentIndex)) {
        return NextResponse.json(
          { error: "本次 Session 作品交付已完成" },
          { status: 400 }
        );
      }

      const existingRecord = getPersistedSessionRecords(project).find(
        (record) => record.sessionIndex === currentIndex
      );

      if (!existingRecord) {
        return NextResponse.json(
          { error: "找不到本次 Session 紀錄" },
          { status: 400 }
        );
      }

      const deliveryCompletedAt = new Date();
      const sessionRecords = [
        ...(project.sessionRecords ?? []).filter(
          (record) => record.sessionIndex !== currentIndex
        ),
        {
          ...existingRecord,
          deliveryCompletedAt,
        },
      ].sort((a, b) => a.sessionIndex - b.sessionIndex);

      const nextSessionIndex = currentIndex + 1;
      const advancedProject: Project = {
        ...project,
        sessionRecords,
        status: "quoting",
        currentSessionIndex: nextSessionIndex,
        confirmedTimeSlot: undefined,
        proposedTimeSlots: [],
        sessionDetails: clearCurrentSessionPricing(project.sessionDetails),
      };

      await updateProjectFields(projectId, advancedProject);
      notifySessionDeliveryComplete(advancedProject);

      return NextResponse.json({
        projectId,
        status: advancedProject.status,
        currentSessionIndex: advancedProject.currentSessionIndex,
      });
    }

    if (updates.confirmDeposit) {
      if (project.status !== "deposit_submitted") {
        return NextResponse.json(
          { error: "目前無法確認訂金" },
          { status: 400 }
        );
      }

      const confirmedSlot =
        getActiveProjectTimeSlot(project) ?? project.confirmedTimeSlot;

      if (!confirmedSlot) {
        return NextResponse.json({ error: "缺少時段" }, { status: 400 });
      }

      if (requiresDepositForCurrentSession(project) && !project.depositProofUrl) {
        return NextResponse.json({ error: "缺少訂金證明" }, { status: 400 });
      }

      const currentIndex = getCurrentSessionIndex(project);

      const confirmedTimeSlots = [
        ...(project.confirmedTimeSlots ?? []),
        confirmedSlot,
      ];
      const totalSessions = getTotalSessions(project);
      const hasMoreSessions = confirmedTimeSlots.length < totalSessions;

      const sessionRecord: SessionRecord = {
        sessionIndex: currentIndex,
        confirmedTimeSlot: confirmedSlot,
        depositProofUrl: project.depositProofUrl,
        depositSubmittedAt: project.depositSubmittedAt,
        confirmedAt: new Date(),
      };
      const sessionRecords = [
        ...(project.sessionRecords ?? []).filter(
          (record) => record.sessionIndex !== currentIndex
        ),
        sessionRecord,
      ].sort((a, b) => a.sessionIndex - b.sessionIndex);

      const bookedProject: Project = {
        ...project,
        confirmedTimeSlots,
        sessionRecords,
        confirmedTimeSlot: undefined,
        proposedTimeSlots: [],
        status: "booked",
        currentSessionIndex: currentIndex,
        depositProofUrl: undefined,
        depositSubmittedAt: undefined,
      };

      const studio = await getStudioById(project.studioId);
      if (studio) {
        const records = ensurePreSessionDocumentRecords(bookedProject, studio);
        if (records) {
          bookedProject.preSessionDocumentRecords = records;
        }
      }

      await updateProjectFields(projectId, bookedProject);

      notifyDepositConfirmed(bookedProject);

      return NextResponse.json({
        projectId,
        status: bookedProject.status,
        currentSessionIndex: bookedProject.currentSessionIndex,
      });
    }

    const nextProposedSlots =
      updates.proposedTimeSlots !== undefined
        ? parseTimeSlots(updates.proposedTimeSlots)
        : project.proposedTimeSlots;

    const pricedSessionIndex =
      updates.currentSessionIndex ?? getCurrentSessionIndex(project);
    const nextSessionDetails = updates.sessionDetails
      ? ({
          ...(updates.sessionDetails as SessionDetails),
          pricedSessionIndex,
        } satisfies SessionDetails)
      : project.sessionDetails;

    let nextSketchRecords = getSketchRecords(project);

    if (updates.appendSketchRecords?.length) {
      const uploadedAt = new Date();
      const sessionIndex = getCurrentSessionIndex(project);
      const additions = updates.appendSketchRecords.map((record) => ({
        id: crypto.randomUUID(),
        url: record.url,
        uploadedAt,
        note: record.note?.trim() || undefined,
        sessionIndex,
        uploadedByUserId: user.uid,
      }));
      nextSketchRecords = appendSketchRecords(nextSketchRecords, additions);
    }

    if (updates.updateSketchNote) {
      const trimmedNote = updates.updateSketchNote.note.trim();
      nextSketchRecords = nextSketchRecords.map((record) =>
        record.id === updates.updateSketchNote?.id
          ? { ...record, note: trimmedNote || undefined }
          : record
      );
    }

    const nextSketches =
      updates.sketches ??
      (updates.appendSketchRecords || updates.updateSketchNote
        ? syncSketchesFromRecords(nextSketchRecords)
        : project.sketches);

    if (updates.sketches && !updates.appendSketchRecords) {
      nextSketchRecords = updates.sketches.map((url, index) => {
        const existing = nextSketchRecords.find((record) => record.url === url);
        return (
          existing ?? {
            id: crypto.randomUUID(),
            url,
            uploadedAt: new Date(),
          }
        );
      });
    }

    const nextProject: Project = {
      ...project,
      artistId: updates.artistId ?? project.artistId,
      status: (updates.status ?? project.status) as ProjectStatus,
      sessionDetails: nextSessionDetails,
      proposedTimeSlots: nextProposedSlots,
      currentSessionIndex:
        updates.currentSessionIndex ?? project.currentSessionIndex,
      privateNotes:
        updates.privateNotes !== undefined
          ? updates.privateNotes
          : project.privateNotes,
      sketchRecords:
        nextSketchRecords.length > 0 ? nextSketchRecords : undefined,
      sketches: nextSketches,
      finalPhotos: updates.finalPhotos ?? project.finalPhotos,
    };

    if (
      needsFreshSessionPricing(nextProject) &&
      nextProject.sessionDetails &&
      !updates.sessionDetails
    ) {
      nextProject.sessionDetails = clearCurrentSessionPricing(
        nextProject.sessionDetails
      );
    }

    if (updates.quoteOnly) {
      nextProject.status = project.status;
    } else if (
      updates.sessionDetails &&
      !updates.status &&
      nextProposedSlots &&
      nextProposedSlots.length > 0
    ) {
      nextProject.status = "pending_payment";
    }

    if (
      nextProject.status === "booked" &&
      project.status !== "booked"
    ) {
      const studio = await getStudioById(project.studioId);
      if (studio) {
        const records = ensurePreSessionDocumentRecords(nextProject, studio);
        if (records) {
          nextProject.preSessionDocumentRecords = records;
        }
      }
    }

    await updateProjectFields(projectId, nextProject);

    const quoteChanged = sessionDetailsChanged(
      project.sessionDetails,
      nextProject.sessionDetails
    );
    const slotsChanged = proposedSlotsChanged(
      project.proposedTimeSlots,
      nextProject.proposedTimeSlots
    );
    const isFirstQuoteSend =
      nextProject.status === "pending_payment" &&
      project.status !== "pending_payment";
    const clientQuoteStatuses = new Set<ProjectStatus>([
      "quoting",
      "pending_payment",
    ]);

    const shouldNotifyQuoteProgress =
      (quoteChanged || slotsChanged || isFirstQuoteSend) &&
      clientQuoteStatuses.has(nextProject.status);

    if (shouldNotifyQuoteProgress) {
      try {
        await notifyQuoteProgressUpdate(nextProject, {
          quoteChanged: quoteChanged || isFirstQuoteSend,
          slotsChanged: slotsChanged || isFirstQuoteSend,
          isFirstSend: isFirstQuoteSend,
        });
      } catch (error) {
        console.error(
          `Quote notification failed for ${projectId}:`,
          error
        );
      }
    } else if (
      isFirstQuoteSend ||
      ((quoteChanged || slotsChanged) &&
        !clientQuoteStatuses.has(nextProject.status))
    ) {
      console.warn(
        `[email] quote_ready skipped for ${projectId}: status=${nextProject.status}, quoteChanged=${quoteChanged}, slotsChanged=${slotsChanged}, isFirstQuoteSend=${isFirstQuoteSend}`
      );
    }

    if (
      nextProject.status === "completed" &&
      project.status !== "completed"
    ) {
      notifyProjectCompleted(nextProject);
    }

    notifyProjectAssetsUploaded(nextProject, {
      sketches: project.sketches,
      finalPhotos: project.finalPhotos,
    });

    return NextResponse.json({
      projectId,
      status: nextProject.status,
      currentSessionIndex: nextProject.currentSessionIndex,
    });
  } catch (error) {
    console.error("Project update failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "資料格式不正確" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}

const clientConfirmSchema = z.object({
  studioSlug: z.string().min(1),
  confirmedTimeSlot: timeSlotSchema.optional(),
  depositProofUrl: z.string().url().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const client = await requireClientUser();

    if (!client) {
      return NextResponse.json({ error: "請先登入客戶帳號" }, { status: 401 });
    }

    const { projectId } = await params;
    const body = await request.json();
    const { studioSlug, confirmedTimeSlot, depositProofUrl } =
      clientConfirmSchema.parse(body);

    const { getStudioBySlug } = await import("@/lib/firestore/studios.server");
    const [studio, project] = await Promise.all([
      getStudioBySlug(studioSlug),
      getProjectById(projectId),
    ]);

    if (!studio || !project || project.studioId !== studio.studioId) {
      return NextResponse.json({ error: "找不到此預約" }, { status: 404 });
    }

    if (!canClientAccessProject(project, client)) {
      return NextResponse.json({ error: "無權限操作此預約" }, { status: 403 });
    }

    if (project.status !== "pending_payment") {
      return NextResponse.json(
        { error: "目前無法確認時段" },
        { status: 403 }
      );
    }

    if (shouldExpireDepositDeadline(project)) {
      return NextResponse.json(
        { error: "訂金期限已過，請重新選擇時段" },
        { status: 400 }
      );
    }

    const requiresDeposit = requiresDepositForCurrentSession(project);
    const hasReservedSlot = !!project.confirmedTimeSlot;

    if (requiresDeposit && depositProofUrl && !confirmedTimeSlot) {
      const depositResult = await submitClientDepositProof({
        client,
        projectId,
        studioSlug,
        depositProofUrl,
      });

      if (!depositResult.ok) {
        return NextResponse.json(
          { error: depositResult.error },
          { status: depositResult.status }
        );
      }

      return NextResponse.json({
        projectId,
        status: depositResult.project.status,
        currentSessionIndex: depositResult.project.currentSessionIndex,
      });
    }

    if (!confirmedTimeSlot) {
      return NextResponse.json({ error: "請選擇時段" }, { status: 400 });
    }

    const slot = parseTimeSlots([confirmedTimeSlot])[0];
    const isProposed = project.proposedTimeSlots?.some(
      (proposed) =>
        proposed.startTime.getTime() === slot.startTime.getTime() &&
        proposed.endTime.getTime() === slot.endTime.getTime()
    );

    if (!isProposed) {
      return NextResponse.json({ error: "請選擇工作室提供的時段" }, { status: 400 });
    }

    if (hasReservedSlot) {
      return NextResponse.json({ error: "已選定時段，請完成訂金轉帳" }, { status: 400 });
    }

    if (requiresDeposit && !depositProofUrl) {
      const now = new Date();
      const deadlineDays = getDepositDeadlineDays(studio);
      const nextProject: Project = {
        ...project,
        status: "pending_payment",
        confirmedTimeSlot: slot,
        proposedTimeSlots: [],
        slotSelectedAt: now,
        depositDeadlineAt: computeDepositDeadlineAt(now, deadlineDays),
      };

      await updateProjectFields(projectId, nextProject);
      notifySlotReserved(nextProject, studio);

      return NextResponse.json({
        projectId,
        status: nextProject.status,
        currentSessionIndex: nextProject.currentSessionIndex,
        depositDeadlineAt: nextProject.depositDeadlineAt?.toISOString(),
      });
    }

    const nextProject: Project = {
      ...project,
      status: "deposit_submitted",
      confirmedTimeSlot: slot,
      proposedTimeSlots: [],
      depositProofUrl,
      depositSubmittedAt: new Date(),
    };

    await updateProjectFields(projectId, nextProject);
    notifyDepositSubmitted(nextProject);

    return NextResponse.json({
      projectId,
      status: nextProject.status,
      currentSessionIndex: nextProject.currentSessionIndex,
    });
  } catch (error) {
    console.error("Client slot confirm failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "資料格式不正確" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "確認失敗" }, { status: 500 });
  }
}
