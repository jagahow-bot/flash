import Image from "next/image";

interface StudioBrandHeaderProps {
  name: string;
  bio?: string;
  logoUrl?: string;
  eyebrow?: string;
}

export function StudioBrandHeader({
  name,
  bio,
  logoUrl,
  eyebrow,
}: StudioBrandHeaderProps) {
  return (
    <div className="text-center">
      {logoUrl ? (
        <div className="mx-auto mb-4 flex size-20 items-center justify-center overflow-hidden rounded-xl border bg-muted/30">
          <Image
            src={logoUrl}
            alt={`${name} LOGO`}
            width={80}
            height={80}
            className="size-full object-cover"
          />
        </div>
      ) : null}
      {eyebrow ? (
        <p className="text-sm text-muted-foreground">{eyebrow}</p>
      ) : null}
      <h1 className="text-3xl font-bold">{name}</h1>
      {bio ? <p className="mt-2 text-muted-foreground">{bio}</p> : null}
    </div>
  );
}
