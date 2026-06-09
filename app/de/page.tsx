import {
  getLocaleMarketingMetadata,
  renderLocaleMarketingPage,
} from "@/lib/i18n/marketing-locale-page";

export const metadata = await getLocaleMarketingMetadata("de");

export default async function GermanMarketingPage() {
  return renderLocaleMarketingPage("de");
}
