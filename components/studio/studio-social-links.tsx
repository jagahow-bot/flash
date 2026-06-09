"use client";

import { ExternalLink } from "lucide-react";
import { useAppDictionary } from "@/components/providers/locale-provider";
import {
  buildStudioSocialLinkItems,
  type StudioSocialLinkItem,
} from "@/lib/social/contact-links";
import type { StudioSocialLinks } from "@/types/studio";
import { cn } from "@/lib/utils";

function SocialLinkIcon({ type }: { type: StudioSocialLinkItem["type"] }) {
  const className = "size-4 shrink-0";

  switch (type) {
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "line":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
      );
    case "threads":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M12.186 0C7.97 0 4.345.547 2.203 2.89c-1.05 1.155-1.596 2.63-1.596 4.338 0 1.707.546 3.182 1.596 4.337 2.142 2.343 5.767 2.89 9.983 2.89s7.841-.547 9.983-2.89c1.05-1.155 1.596-2.63 1.596-4.337 0-1.708-.546-3.183-1.596-4.338C20.027.547 16.402 0 12.186 0zm0 1.09c3.77 0 7.05.49 8.88 1.99 1.05.92 1.6 2.1 1.6 3.258 0 1.158-.55 2.338-1.6 3.258-1.83 1.5-5.11 1.99-8.88 1.99s-7.05-.49-8.88-1.99c-1.05-.92-1.6-2.1-1.6-3.258 0-1.158.55-2.338 1.6-3.258 1.83-1.5 5.11-1.99 8.88-1.99zm-.09 3.82a5.09 5.09 0 110 10.18 5.09 5.09 0 010-10.18zm0 1.09a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      );
  }
}

export function StudioSocialLinks({
  socialLinks,
  className,
  compact = false,
}: {
  socialLinks?: StudioSocialLinks;
  className?: string;
  compact?: boolean;
}) {
  const c = useAppDictionary().common;
  const items = buildStudioSocialLinkItems(socialLinks);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={c.studioSocialLinksAria}
      className={cn(
        "flex flex-wrap items-center justify-center gap-2",
        className
      )}
    >
      {items.map((item) => (
        <a
          key={`${item.type}-${item.display}`}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1.5 text-sm text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-muted",
            compact && "px-2.5 py-1 text-xs"
          )}
        >
          <SocialLinkIcon type={item.type} />
          <span>{item.display}</span>
          <ExternalLink
            className={cn("opacity-50", compact ? "size-3" : "size-3.5")}
            aria-hidden
          />
        </a>
      ))}
    </nav>
  );
}
