import { notFound, redirect } from "next/navigation";
import { ClientSessionBar } from "@/components/client/client-session-bar";
import { BookingFlow } from "@/components/intake/booking-flow";
import { StudioBrandHeader } from "@/components/studio/studio-brand-header";
import { StudioSocialLinks } from "@/components/studio/studio-social-links";
import { canActAsClient } from "@/lib/auth/user-roles";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getStudioBySlug } from "@/lib/firestore/studios.server";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";

export default async function BookPage({
  params,
}: {
  params: Promise<{ studioSlug: string }>;
}) {
  const { studioSlug } = await params;
  const [studio, user, dict] = await Promise.all([
    getStudioBySlug(studioSlug),
    getAuthenticatedUser(),
    getAppDictionary(await getRequestLocale()),
  ]);

  if (!studio) {
    notFound();
  }

  if (!user || !canActAsClient(user)) {
    redirect(
      `/client/login?redirect=${encodeURIComponent(`/${studioSlug}/book`)}`
    );
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:py-10">
        <StudioBrandHeader
          name={studio.name}
          bio={studio.bio}
          logoUrl={studio.logoUrl}
          eyebrow={dict.booking.bookEyebrow}
        />
        <StudioSocialLinks socialLinks={studio.socialLinks} />
        <ClientSessionBar email={user.email} />
      </div>

      <div className="bg-background">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <BookingFlow studio={studio} />
        </div>
      </div>
    </main>
  );
}
