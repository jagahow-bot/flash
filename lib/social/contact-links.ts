import {
  formatInternationalPhone,
  formatPhoneDisplay,
  parseInternationalPhone,
} from "@/lib/phone/format";
import { formatInstagramHandle } from "@/lib/studio/social-links";
import type { ClientSocialContacts } from "@/types/intake-form";
import type { StudioSocialLinks } from "@/types/studio";

export type ContactLinkType =
  | "phone"
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "line"
  | "threads";

export type ContactLinkItem = {
  type: ContactLinkType;
  label: string;
  url: string;
  display: string;
};

function trimValue(value: string | undefined): string {
  return value?.trim() ?? "";
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function stripHandle(value: string): string {
  return value.replace(/^@+/, "").trim();
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function buildPhoneUrl(international: string): string | null {
  const digits = digitsOnly(international);
  return digits ? `tel:+${digits}` : null;
}

function buildWhatsappUrl(value: string): string | null {
  const digits = digitsOnly(value);
  return digits ? `https://wa.me/${digits}` : null;
}

function buildInstagramUrl(value: string): string | null {
  if (isHttpUrl(value)) {
    return value;
  }

  const handle = stripHandle(value);
  return handle ? `https://instagram.com/${encodeURIComponent(handle)}` : null;
}

function buildFacebookUrl(value: string): string | null {
  if (isHttpUrl(value)) {
    return value;
  }

  const handle = stripHandle(value);
  return handle ? `https://facebook.com/${encodeURIComponent(handle)}` : null;
}

function buildLineUrl(value: string): string | null {
  if (isHttpUrl(value)) {
    return value;
  }

  const id = stripHandle(value);
  if (!id) {
    return null;
  }

  if (id.startsWith("~")) {
    return `https://line.me/ti/p/${encodeURIComponent(id)}`;
  }

  return `https://line.me/ti/p/~${encodeURIComponent(id)}`;
}

function buildThreadsUrl(value: string): string | null {
  if (isHttpUrl(value)) {
    return value;
  }

  const handle = stripHandle(value);
  return handle
    ? `https://www.threads.net/@${encodeURIComponent(handle)}`
    : null;
}

function pushLink(
  items: ContactLinkItem[],
  type: ContactLinkType,
  label: string,
  url: string | null,
  display: string
): void {
  if (!url || !display) {
    return;
  }

  items.push({ type, label, url, display });
}

export function buildContactLinkItems(
  contacts: ClientSocialContacts | undefined
): ContactLinkItem[] {
  if (!contacts) {
    return [];
  }

  const items: ContactLinkItem[] = [];

  const phoneDisplay = formatPhoneDisplay(
    contacts.phoneCountryCode,
    contacts.phone
  );
  const phoneInternational = formatInternationalPhone(
    contacts.phoneCountryCode ?? "",
    contacts.phone ?? ""
  );

  pushLink(
    items,
    "phone",
    "手機",
    buildPhoneUrl(phoneInternational),
    phoneDisplay ?? contacts.phone ?? ""
  );

  const whatsapp = contacts.whatsapp ?? "";
  if (whatsapp) {
    const whatsappParsed = parseInternationalPhone(whatsapp);
    const whatsappDisplay =
      formatPhoneDisplay(whatsappParsed?.countryCode, whatsappParsed?.national) ??
      whatsapp;

    pushLink(
      items,
      "whatsapp",
      "WhatsApp",
      buildWhatsappUrl(whatsapp),
      whatsappDisplay
    );
  }

  pushLink(
    items,
    "instagram",
    "Instagram",
    buildInstagramUrl(contacts.instagram ?? ""),
    contacts.instagram ?? ""
  );

  pushLink(
    items,
    "facebook",
    "Facebook",
    buildFacebookUrl(contacts.facebook ?? ""),
    contacts.facebook ?? ""
  );

  pushLink(
    items,
    "line",
    "LINE",
    buildLineUrl(contacts.line ?? ""),
    contacts.line ?? ""
  );

  pushLink(
    items,
    "threads",
    "Threads",
    buildThreadsUrl(contacts.threads ?? ""),
    contacts.threads ?? ""
  );

  return items;
}

export type StudioSocialLinkType = "instagram" | "facebook" | "line" | "threads";

export type StudioSocialLinkItem = {
  type: StudioSocialLinkType;
  label: string;
  url: string;
  display: string;
};

function formatStudioSocialDisplay(
  type: StudioSocialLinkType,
  value: string
): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (type === "instagram" || type === "threads") {
    return formatInstagramHandle(trimmed);
  }

  if (isHttpUrl(trimmed)) {
    return trimmed.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
  }

  return trimmed;
}

export function buildStudioSocialLinkItems(
  socialLinks: StudioSocialLinks | undefined
): StudioSocialLinkItem[] {
  if (!socialLinks) {
    return [];
  }

  const items: StudioSocialLinkItem[] = [];

  const instagram = trimValue(socialLinks.instagram);
  if (instagram) {
    const url = buildInstagramUrl(instagram);
    if (url) {
      items.push({
        type: "instagram",
        label: "Instagram",
        url,
        display: formatStudioSocialDisplay("instagram", instagram),
      });
    }
  }

  const facebook = trimValue(socialLinks.facebook);
  if (facebook) {
    const url = buildFacebookUrl(facebook);
    if (url) {
      items.push({
        type: "facebook",
        label: "Facebook",
        url,
        display: formatStudioSocialDisplay("facebook", facebook),
      });
    }
  }

  const line = trimValue(socialLinks.line);
  if (line) {
    const url = buildLineUrl(line);
    if (url) {
      items.push({
        type: "line",
        label: "LINE",
        url,
        display: formatStudioSocialDisplay("line", line),
      });
    }
  }

  const threads = trimValue(socialLinks.threads);
  if (threads) {
    const url = buildThreadsUrl(threads);
    if (url) {
      items.push({
        type: "threads",
        label: "Threads",
        url,
        display: formatStudioSocialDisplay("threads", threads),
      });
    }
  }

  return items;
}
