"use client";

import Image from "next/image";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { formatMessage } from "@/lib/i18n/format";
import type { ClientAuthStudioContext } from "@/lib/auth/client-auth-url";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function StudioAuthContextCard({
  studio,
}: {
  studio: ClientAuthStudioContext;
}) {
  const dict = useAppDictionary();
  const t = dict.auth;

  return (
    <Card className="w-full max-w-md border-muted bg-muted/20">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {studio.logoUrl ? (
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background">
              <Image
                src={studio.logoUrl}
                alt={`${studio.name} logo`}
                width={48}
                height={48}
                className="size-full object-cover"
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-lg">
              {formatMessage(t.bookingLoginTitle, { studioName: studio.name })}
            </CardTitle>
            <CardDescription>{t.bookingLoginDescription}</CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
