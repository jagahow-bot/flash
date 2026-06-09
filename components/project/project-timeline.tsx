"use client";

import { Check } from "lucide-react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import {
  buildMultiSessionTimeline,
  buildSingleSessionTimeline,
  shouldUseMultiSessionTimeline,
  type TimelineStep,
} from "@/lib/project/client-timeline";
import type { Project } from "@/types/project";
import { cn } from "@/lib/utils";

function TimelineStepItem({
  step,
  index,
  showCurrentHint = true,
  currentStageLabel,
}: {
  step: TimelineStep;
  index: number;
  showCurrentHint?: boolean;
  currentStageLabel: string;
}) {
  const isDone = step.state === "done";
  const isCurrent = step.state === "current";

  return (
    <li className="flex items-start gap-3 text-sm">
      <span
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs",
          isDone && "border-primary bg-primary text-primary-foreground",
          isCurrent && "border-primary text-primary",
          !isDone && !isCurrent && "text-muted-foreground",
        )}
      >
        {isDone ? <Check className="size-3.5" /> : index + 1}
      </span>
      <div>
        <p className={cn(isCurrent && "font-medium")}>{step.label}</p>
        {isCurrent && showCurrentHint && (
          <p className="text-muted-foreground">{currentStageLabel}</p>
        )}
      </div>
    </li>
  );
}

function SingleSessionTimeline({ project }: { project: Project }) {
  const dict = useAppDictionary();
  const steps = buildSingleSessionTimeline(project, dict);

  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step, index) => (
        <TimelineStepItem
          key={step.key}
          step={step}
          index={index}
          currentStageLabel={dict.project.timelineStage}
        />
      ))}
    </ol>
  );
}

function MultiSessionTimeline({ project }: { project: Project }) {
  const dict = useAppDictionary();
  const { sessions, globalComplete } = buildMultiSessionTimeline(project, dict);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm font-medium">{dict.project.timelineProgress}</p>
      {sessions.map((session) => (
        <div key={session.sessionIndex} className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            {session.label}
          </p>
          <ol className="ml-3 flex flex-col gap-3 border-l border-border pl-4">
            {session.steps.map((step, index) => (
              <TimelineStepItem
                key={`${session.sessionIndex}-${step.key}`}
                step={step}
                index={index}
                currentStageLabel={dict.project.timelineStage}
              />
            ))}
          </ol>
        </div>
      ))}
      <ol className="flex flex-col gap-3 border-t border-border pt-1">
        <TimelineStepItem
          step={globalComplete}
          index={0}
          showCurrentHint={false}
          currentStageLabel={dict.project.timelineStage}
        />
      </ol>
    </div>
  );
}

export function ProjectTimeline({ project }: { project: Project }) {
  if (shouldUseMultiSessionTimeline(project)) {
    return <MultiSessionTimeline project={project} />;
  }

  return <SingleSessionTimeline project={project} />;
}
