import { normalizeUserEmail } from "@/lib/auth/normalize-user-email";
import { canBindAsStudioArtist } from "@/lib/auth/user-roles";
import { getUserByEmail } from "@/lib/firestore/users.server";
import { getArtistsByStudioId } from "@/lib/firestore/artists.server";

export class ArtistBindError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ArtistBindError";
    this.code = code;
  }
}

export function artistBindErrorMessage(error: ArtistBindError): string {
  switch (error.code) {
    case "USER_NOT_FOUND":
      return "找不到此 Email 的 FLASH 帳號";
    case "USER_WRONG_STUDIO":
      return "此 Email 不屬於此工作室";
    case "USER_WRONG_ROLE":
      return "此 Email 無法綁定為刺青師";
    case "EMAIL_ALREADY_BOUND":
      return "此 Email 已綁定其他刺青師";
    default:
      return error.message;
  }
}

export async function resolveArtistUserEmail(
  input: string | null | undefined,
  studioId: string,
  options?: { excludeArtistId?: string }
): Promise<string | undefined> {
  if (input === null || input === undefined) {
    return undefined;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return undefined;
  }

  const userEmail = normalizeUserEmail(trimmed);
  const user = await getUserByEmail(userEmail);

  if (!user) {
    throw new ArtistBindError(
      "USER_NOT_FOUND",
      "找不到此 Email 的 FLASH 帳號"
    );
  }

  if (!canBindAsStudioArtist(user)) {
    throw new ArtistBindError(
      "USER_WRONG_ROLE",
      "此 Email 無法綁定為刺青師"
    );
  }

  const artists = await getArtistsByStudioId(studioId);
  const duplicate = artists.find(
    (artist) =>
      artist.userEmail === userEmail &&
      artist.artistId !== options?.excludeArtistId
  );

  if (duplicate) {
    throw new ArtistBindError(
      "EMAIL_ALREADY_BOUND",
      "此 Email 已綁定其他刺青師"
    );
  }

  return userEmail;
}
