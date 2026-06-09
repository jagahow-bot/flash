import { Timestamp } from "firebase-admin/firestore";
import { countUnreadDiscussionMessages } from "@/lib/project/discussion-read";
import { COLLECTIONS } from "@/lib/firestore/collections";
import { getAdminDb } from "@/lib/firebase-admin";
import type { Project } from "@/types/project";
import type {
  ProjectMessage,
  ProjectMessageAuthorRole,
  ProjectMessageKind,
} from "@/types/project-message";

function messageFromFirestore(
  messageId: string,
  data: Record<string, unknown>
): ProjectMessage {
  const createdAt = data.createdAt as Timestamp | undefined;

  return {
    messageId,
    projectId: String(data.projectId ?? ""),
    authorId: String(data.authorId ?? ""),
    authorRole: data.authorRole as ProjectMessageAuthorRole,
    authorLabel: String(data.authorLabel ?? ""),
    body: String(data.body ?? ""),
    kind: (data.kind as ProjectMessageKind) ?? "message",
    createdAt: createdAt?.toDate() ?? new Date(),
  };
}

export async function getProjectMessages(
  projectId: string
): Promise<ProjectMessage[]> {
  const snapshot = await getAdminDb()
    .collection(COLLECTIONS.projects)
    .doc(projectId)
    .collection(COLLECTIONS.projectMessages)
    .orderBy("createdAt", "asc")
    .get();

  return snapshot.docs.map((doc) =>
    messageFromFirestore(doc.id, doc.data() as Record<string, unknown>)
  );
}

export async function getStudioUnreadDiscussionCounts(
  projects: Array<
    Pick<Project, "projectId" | "clientDiscussionReadAt" | "studioDiscussionReadAt">
  >
): Promise<Record<string, number>> {
  const entries = await Promise.all(
    projects.map(async (project) => {
      const messages = await getProjectMessages(project.projectId);
      const count = countUnreadDiscussionMessages(messages, "studio", project);
      return [project.projectId, count] as const;
    })
  );

  return Object.fromEntries(entries);
}

export async function createProjectMessage(input: {
  projectId: string;
  authorId: string;
  authorRole: ProjectMessageAuthorRole;
  authorLabel: string;
  body: string;
  kind: ProjectMessageKind;
}): Promise<ProjectMessage> {
  const ref = getAdminDb()
    .collection(COLLECTIONS.projects)
    .doc(input.projectId)
    .collection(COLLECTIONS.projectMessages)
    .doc();

  const createdAt = new Date();
  const payload = {
    projectId: input.projectId,
    authorId: input.authorId,
    authorRole: input.authorRole,
    authorLabel: input.authorLabel,
    body: input.body,
    kind: input.kind,
    createdAt: Timestamp.fromDate(createdAt),
  };

  await ref.set(payload);

  return {
    messageId: ref.id,
    ...input,
    createdAt,
  };
}
