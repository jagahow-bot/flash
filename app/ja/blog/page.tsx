import {
  getLocaleBlogIndexMetadata,
  renderLocaleBlogIndexPage,
} from "@/lib/i18n/blog-locale-page";
import type { Locale } from "@/lib/i18n/config";

const locale = "ja" as const satisfies Locale;

export async function generateMetadata() {
  return getLocaleBlogIndexMetadata(locale);
}

export default async function JapaneseBlogIndexPage() {
  return renderLocaleBlogIndexPage(locale);
}
