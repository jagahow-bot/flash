import { formatPhoneDisplay } from "@/lib/phone/format";
import type { PreSessionSignerInfo } from "@/types/pre-session-document";
import type { Project } from "@/types/project";

export function getDefaultSignerInfo(
  project: Project,
  clientEmail?: string
): PreSessionSignerInfo {
  const social = project.intakeForm.socialContacts;
  const phone =
    formatPhoneDisplay(social?.phoneCountryCode, social?.phone) ?? "";

  return {
    name: social?.clientName?.trim() ?? "",
    birthday: "",
    phone,
    email: clientEmail?.trim() ?? "",
  };
}
