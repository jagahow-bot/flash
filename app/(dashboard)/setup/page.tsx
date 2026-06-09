import { redirect } from "next/navigation";
import { ArtistAwaitingStudio } from "@/components/setup/artist-awaiting-studio";
import { OnboardingWizard } from "@/components/setup/onboarding-wizard";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function SetupPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (user.studioId) {
    redirect("/dashboard");
  }

  if (user.role === "artist") {
    return (
      <div className="p-6">
        <ArtistAwaitingStudio email={user.email} />
      </div>
    );
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="p-6">
      <OnboardingWizard email={user.email} />
    </div>
  );
}
