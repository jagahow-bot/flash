"use client";

import { CalendarCheck, Clock, CreditCard, Sparkles } from "lucide-react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { formatMessage } from "@/lib/i18n/format";
import { getActiveProjectTimeSlot } from "@/lib/project/active-session-state";
import { isAwaitingDepositPayment } from "@/lib/project/deposit-deadline";
import { formatDepositDeadline, formatPrice } from "@/lib/project/format";
import {
  formatSessionSlotLabel,
  getBookedSessionCount,
  getCurrentSessionIndex,
  getCurrentSessionDepositLabel,
  getCurrentSessionPricing,
  hasCurrentSessionPricing,
  getSessionBookingTitle,
  getSessionPriceDisplayLabel,
  getSessionProgressLabel,
  getTotalSessions,
  isAwaitingSessionDelivery,
  isMultiSession,
  requiresDepositForCurrentSession,
} from "@/lib/project/session-schedule";
import type { Project } from "@/types/project";
import type { Studio } from "@/types/studio";
import { cn } from "@/lib/utils";
import { ClientDepositUpload } from "@/components/project/client-deposit-upload";
import { ClientSlotPicker } from "@/components/project/client-slot-picker";

const BANNER_STYLES: Record<Project["status"], string> = {
  pending_brief: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
  quoting: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40",
  pending_payment:
    "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/40",
  deposit_submitted:
    "border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-violet-950/40",
  booked: "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40",
  completed: "border-muted bg-muted/40",
  cancelled: "border-muted bg-muted/40",
};

export function ActionBanner({
  project,
  studio,
  studioSlug,
}: {
  project: Project;
  studio: Studio;
  studioSlug: string;
}) {
  const dict = useAppDictionary();
  const p = dict.project;
  const sessionProgress = getSessionProgressLabel(project, p);
  const sessionTitle = getSessionBookingTitle(project, p);
  const totalSessions = getTotalSessions(project);
  const awaitingDeposit = isAwaitingDepositPayment(project);
  const reservedSlot = awaitingDeposit
    ? getActiveProjectTimeSlot(project)
    : undefined;
  const sessionIndex = getCurrentSessionIndex(project);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border p-5",
        BANNER_STYLES[project.status],
      )}
    >
      {project.status === "pending_brief" && (
        <>
          <div className="flex items-center gap-2 font-medium">
            <Sparkles className="size-4" />
            {p.briefProcessing}
          </div>
          <p className="text-sm text-muted-foreground">{p.briefProcessingHint}</p>
        </>
      )}

      {project.status === "quoting" && (
        <>
          <div className="flex items-center gap-2 font-medium">
            <Clock className="size-4" />
            {isMultiSession(project) && sessionIndex > 1
              ? formatMessage(p.arrangingSession, { index: sessionIndex })
              : p.preparingQuote}
          </div>
          <p className="text-sm text-muted-foreground">
            {isMultiSession(project) && totalSessions > 1
              ? formatMessage(p.multiSessionHint, {
                  total: totalSessions,
                  index: sessionIndex,
                })
              : p.quoteSentHint}
          </p>
        </>
      )}

      {project.status === "pending_payment" &&
        project.sessionDetails &&
        hasCurrentSessionPricing(project) && (
        <>
          <div className="flex items-center gap-2 font-medium">
            <CreditCard className="size-4" />
            {awaitingDeposit
              ? isMultiSession(project)
                ? formatMessage(p.completeSessionDeposit, { index: sessionIndex })
                : p.completeDeposit
              : isMultiSession(project)
                ? formatMessage(p.confirmSession, { index: sessionIndex })
                : p.confirmQuote}
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <p>
              {getSessionPriceDisplayLabel(project, p)}：
              {formatPrice(
                getCurrentSessionPricing(project)!.totalPrice,
                dict.common,
              )}
            </p>
            <p>
              {p.sessionDeposit}：
              {requiresDepositForCurrentSession(project)
                ? getCurrentSessionDepositLabel(project, dict)
                : p.noDepositRequired}
            </p>
            <p>
              {p.sessions}：{project.sessionDetails.sessions}
            </p>
            <p>
              {p.hoursPerSession}：{project.sessionDetails.hoursPerSession}
            </p>
          </div>

          {awaitingDeposit && reservedSlot ? (
            <>
              <div className="rounded-lg border bg-background/80 px-4 py-3 text-sm">
                <p className="font-medium">{p.selectedSlot}</p>
                <p className="mt-1">
                  {formatSessionSlotLabel(
                    project,
                    reservedSlot,
                    sessionIndex,
                    dict,
                  )}
                </p>
                {project.depositDeadlineAt ? (
                  <p className="mt-2 text-destructive">
                    {formatMessage(p.depositDeadlineWarning, {
                      deadline: formatDepositDeadline(
                        project.depositDeadlineAt,
                        dict.dates,
                      ),
                    })}
                  </p>
                ) : null}
              </div>

              {requiresDepositForCurrentSession(project) && (
                <>
                  <div className="rounded-lg border bg-background/80 px-4 py-3 text-sm">
                    <p className="font-medium">
                      {isMultiSession(project)
                        ? formatMessage(p.sessionPaymentInfo, {
                            index: sessionIndex,
                          })
                        : p.paymentInfo}
                    </p>
                    <pre className="mt-2 whitespace-pre-wrap font-sans text-muted-foreground">
                      {studio.paymentInfo}
                    </pre>
                  </div>
                  <ClientDepositUpload
                    projectId={project.projectId}
                    studioSlug={studioSlug}
                    totalSessions={totalSessions}
                  />
                </>
              )}
            </>
          ) : (
            <>
              {project.proposedTimeSlots &&
                project.proposedTimeSlots.length > 0 && (
                  <ClientSlotPicker
                    projectId={project.projectId}
                    studioSlug={studioSlug}
                    slots={project.proposedTimeSlots}
                    sessionIndex={sessionIndex}
                    totalSessions={totalSessions}
                    bookingTitle={sessionTitle}
                  />
                )}
              {!requiresDepositForCurrentSession(project) &&
                project.proposedTimeSlots &&
                project.proposedTimeSlots.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {p.noDepositSelectSlot}
                  </p>
                )}
            </>
          )}
        </>
      )}

      {project.status === "deposit_submitted" &&
        getActiveProjectTimeSlot(project) && (
        <>
          <div className="flex items-center gap-2 font-medium">
            <Clock className="size-4" />
            {p.depositUnderReview}
          </div>
          <p className="text-sm">
            {p.selected}
            {formatSessionSlotLabel(
              project,
              getActiveProjectTimeSlot(project)!,
              sessionIndex,
              dict,
            )}
          </p>
          <p className="text-sm text-muted-foreground">{p.depositReviewHint}</p>
        </>
      )}

      {project.status === "booked" && getActiveProjectTimeSlot(project) && (
        <>
          <div className="flex items-center gap-2 font-medium">
            <CalendarCheck className="size-4" />
            {isMultiSession(project) && sessionProgress
              ? p.sessionConfirmed
              : p.bookingConfirmed}
          </div>
          <p className="text-sm">
            {formatSessionSlotLabel(
              project,
              getActiveProjectTimeSlot(project)!,
              getBookedSessionCount(project) || sessionIndex,
              dict,
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            {isAwaitingSessionDelivery(project)
              ? p.arriveOnTimeMulti
              : p.arriveOnTime}
          </p>
        </>
      )}

      {project.status === "cancelled" && (
        <>
          <div className="flex items-center gap-2 font-medium">
            <CalendarCheck className="size-4" />
            {p.bookingCancelled}
          </div>
          <p className="text-sm text-muted-foreground">{p.bookingCancelledHint}</p>
        </>
      )}

      {project.status === "completed" && (
        <>
          <div className="flex items-center gap-2 font-medium">
            <CalendarCheck className="size-4" />
            {p.tattooCompleted}
          </div>
          <p className="text-sm text-muted-foreground">{p.aftercareIntro}</p>
          <div className="rounded-lg border bg-background/80 px-4 py-3 text-sm">
            <pre className="whitespace-pre-wrap font-sans text-muted-foreground">
              {studio.careGuide}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
