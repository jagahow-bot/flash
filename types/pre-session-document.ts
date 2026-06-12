export type PreSessionSignatureMode = "in_person" | "online_advance";

export interface PreSessionDocumentTemplate {
  documentId: string;
  title: string;
  description?: string;
  templateFileUrl: string;
  signatureMode: PreSessionSignatureMode;
  isRequired: boolean;
  sortOrder: number;
  createdAt?: Date;
}

export type PreSessionDocumentStatus = "pending" | "completed";

export type PreSessionCompletionMethod = "studio_upload" | "client_signature";

export interface PreSessionSignerInfo {
  name: string;
  /** ISO date string (YYYY-MM-DD) */
  birthday: string;
  phone: string;
  email: string;
}

export interface PreSessionDocumentRecord {
  documentId: string;
  title: string;
  signatureMode: PreSessionSignatureMode;
  status: PreSessionDocumentStatus;
  isRequired: boolean;
  completedAt?: Date;
  completionMethod?: PreSessionCompletionMethod;
  fileUrl?: string;
  signedByUserId?: string;
  clientSignatureDataUrl?: string;
  signerInfo?: PreSessionSignerInfo;
}
