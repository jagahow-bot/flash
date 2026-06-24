"use client";

import Link from "next/link";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

type PreviewNavTab = "dashboard" | "artists" | "settings" | "client";

interface PreviewNavProps {
  studioSlug: string;
  activeTab: PreviewNavTab;
  clientProjectId?: string;
}

export function PreviewNav({
  studioSlug: _studioSlug,
  activeTab,
  clientProjectId,
}: PreviewNavProps) {
  const dict = useAppDictionary();
  const p = dict.preview;

  const tabs: { id: PreviewNavTab; label: string; href: string }[] = [
    { id: "dashboard", label: p.navDashboard, href: "/preview/dashboard" },
    { id: "artists", label: dict.shell.navArtists, href: "/preview/artists" },
    { id: "settings", label: dict.shell.navSettings, href: "/preview/settings" },
    {
      id: "client",
      label: p.navClient,
      href: clientProjectId
        ? `/preview/client/project/${clientProjectId}`
        : "/preview/client",
    },
  ];

  return (
    <nav
      aria-label={p.navAriaLabel}
      className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            activeTab === tab.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
