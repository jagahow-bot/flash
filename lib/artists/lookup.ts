import type { Artist } from "@/types/artist";

export function buildArtistNameMap(artists: Artist[]): Map<string, string> {
  return new Map(artists.map((artist) => [artist.artistId, artist.displayName]));
}

export function getArtistDisplayName(
  artistId: string | undefined,
  artists: Artist[]
): string | null {
  if (!artistId) return null;
  return artists.find((artist) => artist.artistId === artistId)?.displayName ?? null;
}
