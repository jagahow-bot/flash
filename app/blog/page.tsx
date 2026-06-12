import {
  getLocaleBlogIndexMetadata,
  renderLocaleBlogIndexPage,
} from "@/lib/i18n/blog-locale-page";
import { defaultLocale } from "@/lib/i18n/config";

export async function generateMetadata() {
  return getLocaleBlogIndexMetadata(defaultLocale);
}

export default async function BlogIndexPage() {
  return renderLocaleBlogIndexPage(defaultLocale);
}
