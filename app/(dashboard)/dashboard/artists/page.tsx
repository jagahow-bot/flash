import { redirect } from "next/navigation";
import { ArtistManagement } from "@/components/settings/artist-management";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getArtistsByStudioId } from "@/lib/firestore/artists.server";
import { getStudioById } from "@/lib/firestore/studios.server";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";

export default async function StudioArtistsPage() {
  const user = await getAuthenticatedUser();

  if (!user?.studioId) {
    redirect("/setup");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  const [studio, artists] = await Promise.all([
    getStudioById(user.studioId),
    getArtistsByStudioId(user.studioId),
  ]);

  if (!studio) {
    redirect("/setup");
  }

  const locale = await getRequestLocale();
  const dict = await getAppDictionary(locale);
  const a = dict.artists;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">{a.pageTitle}</h1>
        <p className="text-muted-foreground">{a.pageSubtitle}</p>
      </div>

      <ArtistManagement
        studio={studio}
        artists={artists}
        adminEmail={user.email}
      />
    </div>
  );
}
