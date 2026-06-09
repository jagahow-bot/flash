import {
  getLocaleMarketingMetadata,
  renderLocaleMarketingPage,
} from "@/lib/i18n/marketing-locale-page";

export const metadata = await getLocaleMarketingMetadata("en");

export default async function EnglishMarketingPage() {
  return renderLocaleMarketingPage("en");
}
