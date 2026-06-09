import { mockArtists } from "@/data/mock/artists";
import { mockProjects } from "@/data/mock/projects";
import { mockStudio, mockStudios } from "@/data/mock/studios";
import { mockUsers } from "@/data/mock/users";
import { normalizeProjectSketches } from "@/lib/project/sketch-records";
import type { Project, ProjectStatus } from "@/types/project";

export {
  MOCK_STUDIO_ID,
  MOCK_ARTIST_IDS,
  MOCK_USER_IDS,
  MOCK_PROJECT_IDS,
} from "@/data/mock/ids";
export { mockUsers, mockAdminUser, mockArtistUser } from "@/data/mock/users";
export { mockArtists } from "@/data/mock/artists";
export { mockStudio, mockStudios } from "@/data/mock/studios";
export { mockProjects } from "@/data/mock/projects";

export const mockDataSummary = {
  users: mockUsers.length,
  studios: mockStudios.length,
  artists: mockArtists.length,
  projects: mockProjects.length,
};

export function getMockArtistsByStudio(studioId: string) {
  return mockArtists.filter((artist) => artist.studioId === studioId);
}

export function getMockStudioBySlug(slug: string) {
  return mockStudios.find((studio) => studio.slug === slug) ?? null;
}

export function getMockStudioById(studioId: string) {
  return mockStudios.find((studio) => studio.studioId === studioId) ?? null;
}

export function getMockProjectsByStudio(studioId: string): Project[] {
  return mockProjects.filter((project) => project.studioId === studioId);
}

export function getMockProjectsByClientId(clientId: string): Project[] {
  return mockProjects.filter((project) => project.clientId === clientId);
}

export function getMockProjectsByStatus(
  studioId: string,
  status: ProjectStatus
): Project[] {
  return mockProjects.filter(
    (project) => project.studioId === studioId && project.status === status
  );
}

export function getMockProjectById(projectId: string): Project | null {
  const project = mockProjects.find((item) => item.projectId === projectId);
  return project ? normalizeProjectSketches(project) : null;
}

export function getMockUserById(uid: string) {
  return mockUsers.find((user) => user.uid === uid) ?? null;
}
