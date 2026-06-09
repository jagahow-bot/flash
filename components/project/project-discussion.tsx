"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { formatMessage } from "@/lib/i18n/format";
import { getProjectMessageKindLabel } from "@/lib/project/message-labels";
import type { ProjectMessage, ProjectMessageKind } from "@/types/project-message";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type DiscussionMode = "client" | "studio";

type ApiMessage = Omit<ProjectMessage, "createdAt"> & {
  createdAt: string;
  isUnread?: boolean;
};

type ProjectDiscussionContentProps = {
  projectId: string;
  mode: DiscussionMode;
  intakeEditHref?: string;
  showIntakeRevisionHint?: boolean;
  isExpanded?: boolean;
  onUnreadCountChange?: (count: number) => void;
};

function formatMessageTime(value: string): string {
  return new Intl.DateTimeFormat("zh-TW", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function ProjectDiscussionContent({
  projectId,
  mode,
  intakeEditHref,
  showIntakeRevisionHint,
  isExpanded = true,
  onUnreadCountChange,
}: ProjectDiscussionContentProps) {
  const dict = useAppDictionary();
  const p = dict.project;
  const c = dict.common;
  const router = useRouter();
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<ProjectMessageKind>("message");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const markDiscussionRead = useCallback(async () => {
    await fetch(`/api/projects/${projectId}/messages/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context: mode }),
    });
    setUnreadCount(0);
    onUnreadCountChange?.(0);
    setMessages((current) =>
      current.map((message) => ({ ...message, isUnread: false }))
    );
  }, [mode, onUnreadCountChange, projectId]);

  const loadMessages = useCallback(async () => {
    const response = await fetch(
      `/api/projects/${projectId}/messages?context=${mode}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? p.loadFailed);
    }

    const count = data.unreadCount ?? 0;
    setMessages(data.messages ?? []);
    setUnreadCount(count);
    onUnreadCountChange?.(count);
    return count;
  }, [mode, onUnreadCountChange, projectId]);

  useEffect(() => {
    loadMessages()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : p.loadFailed);
      })
      .finally(() => setIsLoading(false));
  }, [loadMessages]);

  useEffect(() => {
    if (isLoading || unreadCount === 0 || !isExpanded) {
      return;
    }

    const timer = window.setTimeout(() => {
      void markDiscussionRead();
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [isExpanded, isLoading, markDiscussionRead, unreadCount]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, kind, context: mode }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? p.submitFailed);
        return;
      }

      setBody("");
      setKind("message");
      await loadMessages();
      await markDiscussionRead();
      router.refresh();
    } catch {
      setError(p.submitFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-col gap-4">
      {unreadCount > 0 ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          <Bell className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">
              {formatMessage(p.unreadTitle, { count: unreadCount })}
            </p>
            <p className="mt-1 text-amber-900/80 dark:text-amber-100/80">
              {mode === "client" ? p.unreadClientHint : p.unreadStudioHint}
            </p>
          </div>
        </div>
      ) : null}

      {showIntakeRevisionHint && intakeEditHref ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          <p className="font-medium">{p.revisionRequestTitle}</p>
          <p className="mt-1 text-muted-foreground">{p.revisionRequestHint}</p>
          <Link
            href={intakeEditHref}
            className="mt-3 inline-flex text-sm font-medium underline underline-offset-4"
          >
            {p.goToEditIntake}
          </Link>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-lg border bg-muted/20 p-3 sm:max-h-56">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{p.loadingMessages}</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">{p.emptyMessagesAlt}</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.messageId}
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                message.isUnread
                  ? "border border-amber-300 bg-amber-50 shadow-sm dark:border-amber-800 dark:bg-amber-950/30"
                  : message.authorRole === "studio"
                    ? "bg-background"
                    : "bg-primary/5"
              )}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {message.authorRole === "studio" ? p.studioLabel : p.clientLabel}
                </span>
                {message.isUnread ? (
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {p.newBadge}
                  </span>
                ) : null}
                {message.kind !== "message" ? (
                  <span className="rounded-full bg-muted px-2 py-0.5">
                    {getProjectMessageKindLabel(message.kind, p)}
                  </span>
                ) : null}
                <span>{formatMessageTime(message.createdAt)}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap">{message.body}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex shrink-0 flex-col gap-3">
        {mode === "studio" ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={kind === "message" ? "default" : "outline"}
              onClick={() => setKind("message")}
            >
              {p.generalMessage}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={kind === "request_intake_revision" ? "default" : "outline"}
              onClick={() => setKind("request_intake_revision")}
            >
              {p.requestRevision}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={kind === "request_confirmation" ? "default" : "outline"}
              onClick={() => setKind("request_confirmation")}
            >
              {p.requestConfirmation}
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={kind === "message" ? "default" : "outline"}
              onClick={() => setKind("message")}
            >
              {p.replyMessage}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={kind === "client_confirmed" ? "default" : "outline"}
              onClick={() => setKind("client_confirmed")}
            >
              {p.replyConfirmation}
            </Button>
          </div>
        )}

        <Textarea
          rows={3}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={
            kind === "request_intake_revision"
              ? p.placeholderRevision
              : kind === "request_confirmation"
                ? p.placeholderConfirmation
                : kind === "client_confirmed"
                  ? p.placeholderClientConfirmed
                  : p.placeholderMessage
          }
        />

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="sm" className="w-fit" disabled={isSubmitting}>
          {isSubmitting ? c.submitting : p.sendMessage}
        </Button>
      </form>
    </div>
  );
}

export function FloatingDiscussionPanel({
  projectId,
  mode,
  intakeEditHref,
  showIntakeRevisionHint,
}: {
  projectId: string;
  mode: DiscussionMode;
  intakeEditHref?: string;
  showIntakeRevisionHint?: boolean;
}) {
  const p = useAppDictionary().project;
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const hasAutoExpandedRef = useRef(false);

  const handleUnreadCountChange = useCallback((count: number) => {
    setUnreadCount(count);
    if (count > 0 && !hasAutoExpandedRef.current) {
      hasAutoExpandedRef.current = true;
      setIsExpanded(true);
    }
  }, []);

  const description =
    mode === "studio" ? p.floatingStudioDescription : p.floatingClientDescription;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:right-0 sm:justify-end sm:p-4"
      aria-live="polite"
    >
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className={cn(
            "pointer-events-auto inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2.5 text-sm font-medium shadow-lg transition-colors hover:bg-muted/60",
            unreadCount > 0 &&
              "border-amber-400 bg-amber-50 ring-2 ring-amber-200/80 dark:bg-amber-950/40"
          )}
          aria-expanded={false}
          aria-label={p.expandAria}
        >
          <MessageSquare className="size-4" />
          <span>{p.discussion}</span>
          {unreadCount > 0 ? (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.5 text-xs font-semibold text-white">
              {unreadCount}
            </span>
          ) : null}
          <ChevronUp className="size-4 text-muted-foreground" />
        </button>
      ) : null}

      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-xl border bg-background shadow-2xl",
          isExpanded
            ? "pointer-events-auto w-full max-w-md max-h-[min(70vh,32rem)]"
            : "pointer-events-none absolute h-px w-px overflow-hidden opacity-0",
          unreadCount > 0 && isExpanded && "border-amber-400 ring-2 ring-amber-200/80"
        )}
        aria-hidden={!isExpanded}
      >
        {isExpanded ? (
          <div className="flex shrink-0 items-start gap-3 border-b px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <MessageSquare className="size-4 shrink-0" />
                <h2 className="text-sm font-semibold">{p.discussion}</h2>
                {unreadCount > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                    <Bell className="size-3" />
                    {unreadCount}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              onClick={() => setIsExpanded(false)}
              aria-label={p.collapseAria}
            >
              <ChevronDown className="size-4" />
            </Button>
          </div>
        ) : null}

        <div
          className={cn(
            "flex min-h-0 flex-col",
            isExpanded && "flex-1 overflow-y-auto p-4"
          )}
        >
          <ProjectDiscussionContent
            projectId={projectId}
            mode={mode}
            intakeEditHref={intakeEditHref}
            showIntakeRevisionHint={showIntakeRevisionHint}
            isExpanded={isExpanded}
            onUnreadCountChange={handleUnreadCountChange}
          />
        </div>
      </div>
    </div>
  );
}
