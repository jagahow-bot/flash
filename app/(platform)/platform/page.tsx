import { PlatformStudiosDashboard } from "@/components/platform/platform-studios-dashboard";
import { listPlatformStudioSummaries } from "@/lib/firestore/platform-studios.server";

export default async function PlatformAdminPage() {
  const studios = await listPlatformStudioSummaries();

  return <PlatformStudiosDashboard initialStudios={studios} />;
}
