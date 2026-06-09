import type { AppDictionary } from "@/lib/i18n/app-types";
import { formatMessage } from "@/lib/i18n/format";
import {
  formatInternationalPhone,
  formatPhoneDisplay,
  parseInternationalPhone,
  phonesMatch,
} from "@/lib/phone/format";
import { isGuestClientProject } from "@/lib/project/client-access";
import type { IntakeForm } from "@/types/intake-form";
import type { Project } from "@/types/project";
import type { User } from "@/types/user";

export function getClientDisplayName(
  project: Pick<Project, "clientId" | "intakeForm">,
  clientUser: User | null,
  dict: AppDictionary["project"],
): string {
  const formName = project.intakeForm.socialContacts?.clientName?.trim();
  if (formName) {
    return formName;
  }

  if (clientUser?.email) {
    return clientUser.email;
  }

  if (isGuestClientProject(project as Project)) {
    return dict.guestClient;
  }

  return dict.clientLabel;
}

function formatStoredWhatsapp(whatsapp: string): string {
  const parsed = parseInternationalPhone(whatsapp);
  return (
    formatPhoneDisplay(parsed?.countryCode, parsed?.national) ?? whatsapp
  );
}

export function getClientContactHint(
  intakeForm: IntakeForm,
  dict: AppDictionary["project"],
): string | null {
  const social = intakeForm.socialContacts;
  if (!social) return null;

  const phoneDisplay = formatPhoneDisplay(social.phoneCountryCode, social.phone);
  const phoneInternational = formatInternationalPhone(
    social.phoneCountryCode ?? "",
    social.phone ?? "",
  );
  const showWhatsapp =
    social.whatsapp &&
    !phonesMatch(phoneInternational, social.whatsapp);

  const entries = [
    social.gender &&
      formatMessage(dict.contactGender, { gender: social.gender }),
    phoneDisplay &&
      formatMessage(dict.contactPhone, { phone: phoneDisplay }),
    social.line && formatMessage(dict.contactLine, { line: social.line }),
    social.instagram &&
      formatMessage(dict.contactInstagram, { instagram: social.instagram }),
    showWhatsapp &&
      formatMessage(dict.contactWhatsapp, {
        phone: formatStoredWhatsapp(social.whatsapp!),
      }),
    social.facebook &&
      formatMessage(dict.contactFacebook, { facebook: social.facebook }),
    social.threads &&
      formatMessage(dict.contactThreads, { threads: social.threads }),
  ].filter(Boolean);

  return entries.length > 0 ? entries.join(" · ") : null;
}
