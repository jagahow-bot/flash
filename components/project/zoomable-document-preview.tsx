"use client";

import Image from "next/image";
import { Minus, Plus, X, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function isImageUrl(url: string): boolean {
  return /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url);
}

function isPdfUrl(url: string): boolean {
  return /\.pdf(\?|$)/i.test(url);
}

export function ZoomableDocumentPreview({
  url,
  title,
  tapToZoomLabel,
  closeLabel,
  zoomInLabel,
  zoomOutLabel,
  openPdfLabel,
  className,
  thumbnailClassName,
}: {
  url: string;
  title: string;
  tapToZoomLabel: string;
  closeLabel: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  openPdfLabel: string;
  className?: string;
  thumbnailClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);

  const isImage = isImageUrl(url);
  const isPdf = isPdfUrl(url);

  const close = useCallback(() => {
    setIsOpen(false);
    setScale(1);
    pinchRef.current = null;
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, isOpen]);

  function handleTouchStart(event: React.TouchEvent) {
    if (event.touches.length === 2) {
      const [a, b] = [event.touches[0], event.touches[1]];
      const distance = Math.hypot(
        a.clientX - b.clientX,
        a.clientY - b.clientY
      );
      pinchRef.current = { distance, scale };
    }
  }

  function handleTouchMove(event: React.TouchEvent) {
    if (event.touches.length !== 2 || !pinchRef.current) return;
    const [a, b] = [event.touches[0], event.touches[1]];
    const distance = Math.hypot(
      a.clientX - b.clientX,
      a.clientY - b.clientY
    );
    const ratio = distance / pinchRef.current.distance;
    setScale(Math.min(4, Math.max(0.5, pinchRef.current.scale * ratio)));
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (event.touches.length < 2) {
      pinchRef.current = null;
    }
  }

  if (isPdf) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            "inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline",
            className
          )}
        >
          <ZoomIn className="size-4 shrink-0" aria-hidden="true" />
          {openPdfLabel}
        </button>
        {isOpen ? (
          <DocumentFullscreenOverlay
            title={title}
            closeLabel={closeLabel}
            onClose={close}
          >
            <iframe
              src={url}
              title={title}
              className="h-full w-full border-0 bg-white"
            />
          </DocumentFullscreenOverlay>
        ) : null}
      </>
    );
  }

  if (isImage) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn("group block w-full text-left", className)}
          aria-label={tapToZoomLabel}
        >
          <div
            className={cn(
              "relative aspect-[4/3] w-full overflow-hidden rounded-md border bg-muted",
              thumbnailClassName
            )}
          >
            <Image
              src={url}
              alt={title}
              fill
              className="object-contain transition-opacity group-hover:opacity-90"
              unoptimized
            />
            <span className="absolute bottom-2 right-2 rounded-md bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow-sm">
              {tapToZoomLabel}
            </span>
          </div>
        </button>
        {isOpen ? (
          <DocumentFullscreenOverlay
            title={title}
            closeLabel={closeLabel}
            onClose={close}
            toolbar={
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  aria-label={zoomOutLabel}
                  onClick={() => setScale((value) => Math.max(0.5, value - 0.25))}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="min-w-[3rem] text-center text-xs text-primary-foreground/80">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  aria-label={zoomInLabel}
                  onClick={() => setScale((value) => Math.min(4, value + 0.25))}
                >
                  <Plus className="size-4" />
                </Button>
              </>
            }
          >
            <div
              className="flex h-full w-full items-center justify-center overflow-auto p-4"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={(event) => {
                if (event.ctrlKey || event.metaKey) {
                  event.preventDefault();
                  setScale((value) =>
                    Math.min(4, Math.max(0.5, value - event.deltaY * 0.002))
                  );
                }
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={title}
                draggable={false}
                className="max-h-none max-w-none select-none"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "center center",
                }}
              />
            </div>
          </DocumentFullscreenOverlay>
        ) : null}
      </>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline",
        className
      )}
    >
      <ZoomIn className="size-4 shrink-0" aria-hidden="true" />
      {openPdfLabel}
    </a>
  );
}

function DocumentFullscreenOverlay({
  title,
  closeLabel,
  onClose,
  toolbar,
  children,
}: {
  title: string;
  closeLabel: string;
  onClose: () => void;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <p className="truncate text-sm font-medium text-primary-foreground">
          {title}
        </p>
        <div className="flex items-center gap-2">
          {toolbar}
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
