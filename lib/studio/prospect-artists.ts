import type { Artist } from "@/types/artist";
import type { Studio } from "@/types/studio";

export function prospectArtistId(index: number): string {
  return `prospect-artist-${index}`;
}

export function buildProspectArtists(studio: Studio): Artist[] {
  const names = studio.prospectArtistNames ?? [];
  return names.map((displayName, index) => ({
    artistId: prospectArtistId(index),
    studioId: studio.studioId,
    displayName,
    styles: [],
    isActive: true,
  }));
}

export function pickProspectArtistId(
  studio: Studio,
  projectIndex: number,
): string {
  const artists = buildProspectArtists(studio);
  if (artists.length === 0) {
    return "";
  }
  return artists[projectIndex % artists.length].artistId;
}
