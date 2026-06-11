import { redirect } from "next/navigation";
import { FlashDesignsManager } from "@/components/settings/flash-designs-manager";
import { StudioSettingsForm } from "@/components/settings/studio-settings-form";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getStudioById } from "@/lib/firestore/studios.server";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";

export default async function StudioSettingsPage() {
  const user = await getAuthenticatedUser();

  if (!user?.studioId) {
    redirect("/setup");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  const studio = await getStudioById(user.studioId);

  if (!studio) {
    redirect("/setup");
  }

  const locale = await getRequestLocale();
  const dict = await getAppDictionary(locale);
  const s = dict.settings;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">{s.pageTitle}</h1>
        <p className="text-muted-foreground">{s.pageSubtitle}</p>
      </div>

      <FlashDesignsManager studio={studio} />
      <StudioSettingsForm studio={studio} />
    </div>
  );
}
