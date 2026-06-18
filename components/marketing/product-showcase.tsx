import Image from "next/image";
import { Monitor, Smartphone } from "lucide-react";
import type { LandingDictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

const sectionShell = "mx-auto max-w-6xl px-4";
const proseWidth = "mx-auto max-w-3xl";
const headingClass =
  "text-balance text-2xl font-semibold leading-relaxed tracking-wide sm:text-3xl";
const bodyClass =
  "text-pretty leading-relaxed tracking-wide text-muted-foreground";

export function ProductShowcase({ dict }: { dict: LandingDictionary }) {
  const { productShowcase: copy } = dict;

  return (
    <section
      id="showcase"
      className="border-b"
      aria-labelledby="showcase-heading"
    >
      <div className={cn(sectionShell, "py-16 sm:py-20")}>
        <div className={cn(proseWidth, "text-center")}>
          <h2 id="showcase-heading" className={headingClass}>
            {copy.title}
          </h2>
          <p className={cn("mt-3", bodyClass)}>{copy.subtitle}</p>
        </div>

        <div className="mt-14 space-y-16 lg:space-y-20">
          {/* Studio — desktop */}
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-12">
            <div className="text-center lg:text-left">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground">
                <Monitor className="size-3.5" aria-hidden="true" />
                {copy.studioTitle}
              </div>
              <p className={cn("text-sm sm:text-base", bodyClass)}>
                {copy.studioDescription}
              </p>
            </div>

            <BrowserFrame>
              <Image
                src="/marketing/studio-dashboard.png"
                alt={copy.studioAlt}
                width={1024}
                height={589}
                className="h-auto w-full"
                sizes="(max-width: 1024px) 100vw, 720px"
                priority
              />
            </BrowserFrame>
          </div>

          {/* Client — mobile */}
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-12">
            <div className="text-center lg:order-2 lg:text-left">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground">
                <Smartphone className="size-3.5" aria-hidden="true" />
                {copy.clientTitle}
              </div>
              <p className={cn("text-sm sm:text-base", bodyClass)}>
                {copy.clientDescription}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8 lg:order-1">
              <PhoneFrame>
                <Image
                  src="/marketing/client-progress.png"
                  alt={copy.clientProgressAlt}
                  width={459}
                  height={1024}
                  className="h-auto w-full"
                  sizes="(max-width: 640px) 42vw, 200px"
                />
              </PhoneFrame>
              <PhoneFrame>
                <Image
                  src="/marketing/client-artwork.png"
                  alt={copy.clientArtworkAlt}
                  width={459}
                  height={1024}
                  className="h-auto w-full"
                  sizes="(max-width: 640px) 42vw, 200px"
                />
              </PhoneFrame>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-lg ring-1 ring-foreground/5">
      <div
        className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5"
        aria-hidden="true"
      >
        <span className="size-2.5 rounded-full bg-red-400/80" />
        <span className="size-2.5 rounded-full bg-amber-400/80" />
        <span className="size-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-2 hidden flex-1 truncate rounded-md bg-background/80 px-3 py-1 text-[10px] text-muted-foreground sm:block">
          flash.app/dashboard
        </span>
      </div>
      <div className="bg-background">{children}</div>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[min(42vw,200px)] shrink-0 overflow-hidden rounded-[1.75rem] border-[6px] border-foreground/10 bg-foreground/5 p-1 shadow-lg ring-1 ring-foreground/5 sm:w-[200px]">
      <div className="overflow-hidden rounded-[1.35rem] bg-background">
        {children}
      </div>
    </div>
  );
}
