export type SessionErrorCode =
  | "ADMIN_NOT_CONFIGURED"
  | "ADMIN_KEY_INVALID"
  | "INVALID_ID_TOKEN"
  | "SESSION_CREATE_FAILED";

function getErrorCode(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  return undefined;
}

export function mapSessionCreationError(error: unknown): {
  status: number;
  code: SessionErrorCode;
} {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown error";

  if (message.includes("Missing Firebase Admin credentials")) {
    return {
      status: 503,
      code: "ADMIN_NOT_CONFIGURED",
    };
  }

  if (
    message.includes("Invalid FIREBASE_ADMIN_PRIVATE_KEY") ||
    message.includes("DECODER") ||
    message.includes("PEM routines") ||
    message.includes("private key")
  ) {
    return {
      status: 503,
      code: "ADMIN_KEY_INVALID",
    };
  }

  const errorCode = getErrorCode(error);
  if (
    errorCode === "auth/argument-error" ||
    errorCode === "auth/invalid-id-token"
  ) {
    return {
      status: 401,
      code: "INVALID_ID_TOKEN",
    };
  }

  return {
    status: 401,
    code: "SESSION_CREATE_FAILED",
  };
}
