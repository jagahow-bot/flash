import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { normalizeProjectSketches } from "@/lib/project/sketch-records";
import type { PreSessionDocumentRecord } from "@/types/pre-session-document";
import type { Project } from "@/types/project";
import type { ProjectSketchRecord } from "@/types/project-sketch";
import type { SessionRecord } from "@/types/session-record";
import type { TimeSlot } from "@/types/session-details";

interface FirestoreTimeSlot {
  startTime: Timestamp;
  endTime: Timestamp;
}

interface FirestoreSessionRecord {
  sessionIndex: number;
  confirmedTimeSlot: FirestoreTimeSlot;
  depositProofUrl?: string;
  depositSubmittedAt?: Timestamp;
  confirmedAt?: Timestamp;
  deliveryCompletedAt?: Timestamp;
}

function serializeTimeSlot(slot: TimeSlot): FirestoreTimeSlot {
  return {
    startTime: Timestamp.fromDate(slot.startTime),
    endTime: Timestamp.fromDate(slot.endTime),
  };
}

function deserializeTimeSlot(slot: FirestoreTimeSlot): TimeSlot {
  return {
    startTime: slot.startTime.toDate(),
    endTime: slot.endTime.toDate(),
  };
}

function serializeSessionRecord(record: SessionRecord): FirestoreSessionRecord {
  const data: FirestoreSessionRecord = {
    sessionIndex: record.sessionIndex,
    confirmedTimeSlot: serializeTimeSlot(record.confirmedTimeSlot),
  };

  if (record.depositProofUrl) {
    data.depositProofUrl = record.depositProofUrl;
  }

  if (record.depositSubmittedAt) {
    data.depositSubmittedAt = Timestamp.fromDate(record.depositSubmittedAt);
  }

  if (record.confirmedAt) {
    data.confirmedAt = Timestamp.fromDate(record.confirmedAt);
  }

  if (record.deliveryCompletedAt) {
    data.deliveryCompletedAt = Timestamp.fromDate(record.deliveryCompletedAt);
  }

  return data;
}

function deserializeSessionRecord(record: FirestoreSessionRecord): SessionRecord {
  return {
    sessionIndex: record.sessionIndex,
    confirmedTimeSlot: deserializeTimeSlot(record.confirmedTimeSlot),
    depositProofUrl: record.depositProofUrl,
    depositSubmittedAt: record.depositSubmittedAt?.toDate(),
    confirmedAt: record.confirmedAt?.toDate(),
    deliveryCompletedAt: record.deliveryCompletedAt?.toDate(),
  };
}

interface FirestorePreSessionDocumentRecord {
  documentId: string;
  title: string;
  signatureMode: PreSessionDocumentRecord["signatureMode"];
  status: PreSessionDocumentRecord["status"];
  isRequired: boolean;
  completedAt?: Timestamp;
  completionMethod?: PreSessionDocumentRecord["completionMethod"];
  fileUrl?: string;
  signedByUserId?: string;
  clientSignatureDataUrl?: string;
  signerInfo?: PreSessionDocumentRecord["signerInfo"];
}

function serializePreSessionDocumentRecord(
  record: PreSessionDocumentRecord
): FirestorePreSessionDocumentRecord {
  const data: FirestorePreSessionDocumentRecord = {
    documentId: record.documentId,
    title: record.title,
    signatureMode: record.signatureMode,
    status: record.status,
    isRequired: record.isRequired,
  };

  if (record.completedAt) {
    data.completedAt = Timestamp.fromDate(record.completedAt);
  }
  if (record.completionMethod) {
    data.completionMethod = record.completionMethod;
  }
  if (record.fileUrl) {
    data.fileUrl = record.fileUrl;
  }
  if (record.signedByUserId) {
    data.signedByUserId = record.signedByUserId;
  }
  if (record.clientSignatureDataUrl) {
    data.clientSignatureDataUrl = record.clientSignatureDataUrl;
  }
  if (record.signerInfo) {
    data.signerInfo = record.signerInfo;
  }

  return data;
}

interface FirestoreSketchRecord {
  id: string;
  url: string;
  uploadedAt: Timestamp;
  note?: string;
  sessionIndex?: number;
  uploadedByUserId?: string;
}

function serializeSketchRecord(
  record: ProjectSketchRecord
): FirestoreSketchRecord {
  const data: FirestoreSketchRecord = {
    id: record.id,
    url: record.url,
    uploadedAt: Timestamp.fromDate(record.uploadedAt),
  };

  if (record.note) {
    data.note = record.note;
  }
  if (record.sessionIndex !== undefined) {
    data.sessionIndex = record.sessionIndex;
  }
  if (record.uploadedByUserId) {
    data.uploadedByUserId = record.uploadedByUserId;
  }

  return data;
}

function deserializeSketchRecord(
  record: FirestoreSketchRecord
): ProjectSketchRecord {
  return {
    id: record.id,
    url: record.url,
    uploadedAt: record.uploadedAt.toDate(),
    note: record.note,
    sessionIndex: record.sessionIndex,
    uploadedByUserId: record.uploadedByUserId,
  };
}

function deserializePreSessionDocumentRecord(
  record: FirestorePreSessionDocumentRecord
): PreSessionDocumentRecord {
  return {
    documentId: record.documentId,
    title: record.title,
    signatureMode: record.signatureMode,
    status: record.status,
    isRequired: record.isRequired,
    completedAt: record.completedAt?.toDate(),
    completionMethod: record.completionMethod,
    fileUrl: record.fileUrl,
    signedByUserId: record.signedByUserId,
    clientSignatureDataUrl: record.clientSignatureDataUrl,
    signerInfo: record.signerInfo,
  };
}

function stripUndefined(
  record: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined)
  );
}

/** 將 Project 轉為可寫入 Firestore 的文件格式（Date → Timestamp） */
export function projectToFirestore(
  project: Project,
  options?: { forUpdate?: boolean }
): Record<string, unknown> {
  const forUpdate = options?.forUpdate ?? false;
  const data: Record<string, unknown> = { ...project };

  if (project.proposedTimeSlots !== undefined) {
    data.proposedTimeSlots = project.proposedTimeSlots.map(serializeTimeSlot);
  } else if (forUpdate) {
    data.proposedTimeSlots = FieldValue.delete();
  } else {
    delete data.proposedTimeSlots;
  }

  if (project.confirmedTimeSlots !== undefined) {
    data.confirmedTimeSlots = project.confirmedTimeSlots.map(serializeTimeSlot);
  } else if (forUpdate) {
    data.confirmedTimeSlots = FieldValue.delete();
  } else {
    delete data.confirmedTimeSlots;
  }

  if (project.confirmedTimeSlot) {
    data.confirmedTimeSlot = serializeTimeSlot(project.confirmedTimeSlot);
  } else if (forUpdate) {
    data.confirmedTimeSlot = FieldValue.delete();
  } else {
    delete data.confirmedTimeSlot;
  }

  if (project.sessionRecords !== undefined) {
    data.sessionRecords = project.sessionRecords.map(serializeSessionRecord);
  } else if (forUpdate) {
    data.sessionRecords = FieldValue.delete();
  } else {
    delete data.sessionRecords;
  }

  if (project.depositProofUrl) {
    data.depositProofUrl = project.depositProofUrl;
  } else if (forUpdate) {
    data.depositProofUrl = FieldValue.delete();
  } else {
    delete data.depositProofUrl;
  }

  if (project.depositSubmittedAt) {
    data.depositSubmittedAt = Timestamp.fromDate(project.depositSubmittedAt);
  } else if (forUpdate) {
    data.depositSubmittedAt = FieldValue.delete();
  } else {
    delete data.depositSubmittedAt;
  }

  if (project.slotSelectedAt) {
    data.slotSelectedAt = Timestamp.fromDate(project.slotSelectedAt);
  } else if (forUpdate) {
    data.slotSelectedAt = FieldValue.delete();
  } else {
    delete data.slotSelectedAt;
  }

  if (project.depositDeadlineAt) {
    data.depositDeadlineAt = Timestamp.fromDate(project.depositDeadlineAt);
  } else if (forUpdate) {
    data.depositDeadlineAt = FieldValue.delete();
  } else {
    delete data.depositDeadlineAt;
  }

  if (project.clientDiscussionReadAt) {
    data.clientDiscussionReadAt = Timestamp.fromDate(project.clientDiscussionReadAt);
  } else {
    delete data.clientDiscussionReadAt;
  }

  if (project.studioDiscussionReadAt) {
    data.studioDiscussionReadAt = Timestamp.fromDate(project.studioDiscussionReadAt);
  } else {
    delete data.studioDiscussionReadAt;
  }

  if (project.cancelledAt) {
    data.cancelledAt = Timestamp.fromDate(project.cancelledAt);
  } else if (forUpdate) {
    data.cancelledAt = FieldValue.delete();
  } else {
    delete data.cancelledAt;
  }

  if (project.preSessionDocumentRecords !== undefined) {
    data.preSessionDocumentRecords = project.preSessionDocumentRecords.map(
      serializePreSessionDocumentRecord
    );
  } else {
    delete data.preSessionDocumentRecords;
  }

  if (project.sketchRecords !== undefined) {
    data.sketchRecords = project.sketchRecords.map(serializeSketchRecord);
  } else if (forUpdate) {
    data.sketchRecords = FieldValue.delete();
  } else {
    delete data.sketchRecords;
  }

  return stripUndefined(data);
}

/** 將 Firestore 文件轉為應用層 Project（Timestamp → Date） */
export function projectFromFirestore(
  projectId: string,
  data: Record<string, unknown>
): Project {
  const proposedTimeSlots = data.proposedTimeSlots as
    | FirestoreTimeSlot[]
    | undefined;
  const confirmedTimeSlots = data.confirmedTimeSlots as
    | FirestoreTimeSlot[]
    | undefined;
  const confirmedTimeSlot = data.confirmedTimeSlot as
    | FirestoreTimeSlot
    | undefined;
  const sessionRecords = data.sessionRecords as
    | FirestoreSessionRecord[]
    | undefined;
  const depositSubmittedAt = data.depositSubmittedAt as Timestamp | undefined;
  const slotSelectedAt = data.slotSelectedAt as Timestamp | undefined;
  const depositDeadlineAt = data.depositDeadlineAt as Timestamp | undefined;
  const clientDiscussionReadAt = data.clientDiscussionReadAt as
    | Timestamp
    | undefined;
  const studioDiscussionReadAt = data.studioDiscussionReadAt as
    | Timestamp
    | undefined;
  const preSessionDocumentRecords = data.preSessionDocumentRecords as
    | FirestorePreSessionDocumentRecord[]
    | undefined;
  const sketchRecords = data.sketchRecords as
    | FirestoreSketchRecord[]
    | undefined;
  const cancelledAt = data.cancelledAt as Timestamp | undefined;

  const project: Project = {
    ...(data as Omit<
      Project,
      | "projectId"
      | "proposedTimeSlots"
      | "confirmedTimeSlots"
      | "confirmedTimeSlot"
      | "sessionRecords"
      | "depositSubmittedAt"
      | "slotSelectedAt"
      | "depositDeadlineAt"
      | "clientDiscussionReadAt"
      | "studioDiscussionReadAt"
      | "preSessionDocumentRecords"
      | "sketchRecords"
      | "cancelledAt"
    >),
    projectId,
    proposedTimeSlots: proposedTimeSlots?.map(deserializeTimeSlot),
    confirmedTimeSlots: confirmedTimeSlots?.map(deserializeTimeSlot),
    confirmedTimeSlot: confirmedTimeSlot
      ? deserializeTimeSlot(confirmedTimeSlot)
      : undefined,
    sessionRecords: sessionRecords?.map(deserializeSessionRecord),
    depositSubmittedAt: depositSubmittedAt?.toDate(),
    slotSelectedAt: slotSelectedAt?.toDate(),
    depositDeadlineAt: depositDeadlineAt?.toDate(),
    clientDiscussionReadAt: clientDiscussionReadAt?.toDate(),
    studioDiscussionReadAt: studioDiscussionReadAt?.toDate(),
    preSessionDocumentRecords: preSessionDocumentRecords?.map(
      deserializePreSessionDocumentRecord
    ),
    sketchRecords: sketchRecords?.map(deserializeSketchRecord),
    cancelledAt: cancelledAt?.toDate(),
  };

  return normalizeProjectSketches(project);
}
