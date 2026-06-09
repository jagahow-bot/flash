import {
  getMockProjectById,
  getMockProjectsByStudio,
  getMockProjectsByClientId,
} from "@/data/mock/index";
import { COLLECTIONS } from "@/lib/firestore/collections";
import {
  projectFromFirestore,
  projectToFirestore,
} from "@/lib/firestore/serializers";
import { getStudioById } from "@/lib/firestore/studios.server";
import {
  buildExpiredDepositProject,
  shouldExpireDepositDeadline,
} from "@/lib/project/deposit-deadline";
import { notifyDepositDeadlineExpired } from "@/lib/email/project-notifications.server";
import { getAdminDb } from "@/lib/firebase-admin";
import type { Project } from "@/types/project";

async function maybeExpireDepositDeadline(
  project: Project
): Promise<Project> {
  if (!shouldExpireDepositDeadline(project)) {
    return project;
  }

  const expired = buildExpiredDepositProject(project);
  await updateProjectFields(project.projectId, expired);

  const studio = await getStudioById(project.studioId);
  if (studio) {
    notifyDepositDeadlineExpired(expired, studio);
  }

  return expired;
}

export async function getProjectById(
  projectId: string
): Promise<Project | null> {
  const doc = await getAdminDb()
    .collection(COLLECTIONS.projects)
    .doc(projectId)
    .get();

  let project: Project | null = null;

  if (doc.exists) {
    project = projectFromFirestore(projectId, doc.data() as Record<string, unknown>);
  } else {
    project = getMockProjectById(projectId);
  }

  if (!project) {
    return null;
  }

  return maybeExpireDepositDeadline(project);
}

export async function getProjectsByStudioId(
  studioId: string
): Promise<Project[]> {
  const snapshot = await getAdminDb()
    .collection(COLLECTIONS.projects)
    .where("studioId", "==", studioId)
    .get();

  if (!snapshot.empty) {
    const projects = await Promise.all(
      snapshot.docs.map((doc) =>
        maybeExpireDepositDeadline(
          projectFromFirestore(doc.id, doc.data() as Record<string, unknown>)
        )
      )
    );
    return projects;
  }

  return getMockProjectsByStudio(studioId);
}

export async function getProjectsByClientId(
  clientId: string
): Promise<Project[]> {
  const snapshot = await getAdminDb()
    .collection(COLLECTIONS.projects)
    .where("clientId", "==", clientId)
    .get();

  if (!snapshot.empty) {
    const projects = await Promise.all(
      snapshot.docs.map((doc) =>
        maybeExpireDepositDeadline(
          projectFromFirestore(doc.id, doc.data() as Record<string, unknown>)
        )
      )
    );
    return projects;
  }

  return getMockProjectsByClientId(clientId);
}

export async function updateProjectFields(
  projectId: string,
  project: Project
): Promise<void> {
  const ref = getAdminDb().collection(COLLECTIONS.projects).doc(projectId);
  const payload = projectToFirestore(project, { forUpdate: true });
  delete payload.projectId;

  const doc = await ref.get();

  if (doc.exists) {
    await ref.update(payload);
  } else {
    await ref.set(payload);
  }
}

export async function updateProjectIntake(
  projectId: string,
  intakeForm: Project["intakeForm"],
  tattooBrief: NonNullable<Project["tattooBrief"]>
): Promise<void> {
  await getAdminDb()
    .collection(COLLECTIONS.projects)
    .doc(projectId)
    .update({
      intakeForm,
      tattooBrief,
      pendingIntakeRevision: false,
    });
}
