export type ProjectMessageKind =
  | "message"
  | "request_intake_revision"
  | "request_confirmation"
  | "client_confirmed";

export type ProjectMessageAuthorRole = "client" | "studio";

export interface ProjectMessage {
  messageId: string;
  projectId: string;
  authorId: string;
  authorRole: ProjectMessageAuthorRole;
  authorLabel: string;
  body: string;
  kind: ProjectMessageKind;
  createdAt: Date;
}
