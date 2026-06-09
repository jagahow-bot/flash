"use client";

import { useAppDictionary } from "@/components/providers/locale-provider";
import { getActiveProjectTimeSlot } from "@/lib/project/active-session-state";
import { isAwaitingDepositPayment } from "@/lib/project/deposit-deadline";
import { formatDepositDeadline } from "@/lib/project/format";
import {
  formatSessionSlotLabel,
  getCurrentSessionIndex,
  getCurrentSessionPricing,
  getSessionProgressLabel,
} from "@/lib/project/session-schedule";
import type { Project } from "@/types/project";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DepositAwaitingPanel({ project }: { project: Project }) {
  const dict = useAppDictionary();
  const d = dict.dashboard;
  const p = dict.project;

  if (!isAwaitingDepositPayment(project)) {
    return null;
  }

  const activeSlot = getActiveProjectTimeSlot(project);

  if (!activeSlot) {
    return null;
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
      <CardHeader>
        <CardTitle>{d.awaitingClientDeposit}</CardTitle>
        <CardDescription>{d.awaitingClientDepositDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {getSessionProgressLabel(project, p) ? (
          <p className="font-medium">{getSessionProgressLabel(project, p)}</p>
        ) : null}
        <p>
          <span className="text-muted-foreground">{d.reservedSlot}</span>
          {formatSessionSlotLabel(
            project,
            activeSlot,
            getCurrentSessionIndex(project),
            dict,
          )}
        </p>
        {getCurrentSessionPricing(project) && (
          <p>
            <span className="text-muted-foreground">{d.depositDue}</span>
            NT${" "}
            {Number(
              getCurrentSessionPricing(project)!.depositRequired
            ).toLocaleString("en-US")}
          </p>
        )}
        {project.depositDeadlineAt ? (
          <p className="font-medium text-amber-800 dark:text-amber-200">
            {d.depositDeadline}
            {formatDepositDeadline(project.depositDeadlineAt, dict.dates)}
          </p>
        ) : null}
        {project.slotSelectedAt ? (
          <p className="text-muted-foreground">
            {d.selectedTime}
            {formatDepositDeadline(project.slotSelectedAt, dict.dates)}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
