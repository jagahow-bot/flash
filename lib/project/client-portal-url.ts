export function getClientPortalPath(
  studioSlug: string,
  projectId: string
): string {
  return `/${studioSlug}/p/${projectId}`;
}
