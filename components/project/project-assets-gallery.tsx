import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProjectAssetsGallery({
  title,
  urls,
  emptyHint,
  embedded = false,
  variant = "default",
}: {
  title: string;
  urls: string[];
  emptyHint?: string;
  /** Hides section title and tightens spacing when parent renders the header */
  embedded?: boolean;
  /** Larger grid for client-facing project pages */
  variant?: "default" | "large";
}) {
  if (urls.length === 0) {
    if (!emptyHint) return null;

    return (
      <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyHint}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", embedded ? "gap-2" : "gap-3")}>
      {!embedded && <p className="font-medium">{title}</p>}
      <div
        className={cn(
          "grid gap-3",
          variant === "large"
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-2 sm:grid-cols-3"
        )}
      >
        {urls.map((url, index) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "relative overflow-hidden rounded-lg border bg-muted transition-opacity hover:opacity-90",
              variant === "large" ? "aspect-[4/3]" : "aspect-square"
            )}
          >
            <Image
              src={url}
              alt={`${title} ${index + 1}`}
              fill
              className="object-cover"
              sizes={
                variant === "large"
                  ? "(max-width: 640px) 100vw, (max-width: 896px) 50vw, 400px"
                  : "200px"
              }
            />
          </a>
        ))}
      </div>
    </div>
  );
}
