import { weeklyScheduleToOperatingHours } from "@/lib/availability/weekly-schedule";
import type { Artist } from "@/types/artist";
import type { Studio } from "@/types/studio";
import type { StudioOperatingHours } from "@/types/operating-hours";

export function getArtistOperatingHours(
  artist: Artist,
  studio: Studio
): StudioOperatingHours {
  if (artist.weeklySchedule) {
    return weeklyScheduleToOperatingHours(artist.weeklySchedule);
  }

  if (artist.operatingHours) {
    return artist.operatingHours;
  }

  return studio.operatingHours;
}
