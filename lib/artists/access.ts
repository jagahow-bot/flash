import { normalizeUserEmail } from "@/lib/auth/normalize-user-email";
import type { Artist } from "@/types/artist";
import type { Project } from "@/types/project";
import type { User } from "@/types/user";

export function getLinkedArtist(
  artists: Artist[],
  user: User
): Artist | null {
  const email = normalizeUserEmail(user.email);
  return (
    artists.find(
      (artist) =>
        artist.userEmail &&
        normalizeUserEmail(artist.userEmail) === email
    ) ?? null
  );
}

/** Admin 看全部；Artist 只看指派給自己的專案 */
export function filterProjectsForStudioUser(
  projects: Project[],
  user: User,
  artists: Artist[]
): Project[] {
  if (user.role === "admin") {
    return projects;
  }

  if (user.role !== "artist") {
    return projects;
  }

  const linked = getLinkedArtist(artists, user);
  if (!linked) {
    return [];
  }

  return projects.filter((project) => project.artistId === linked.artistId);
}
