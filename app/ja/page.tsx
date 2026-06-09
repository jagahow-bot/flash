import {
  getLocaleMarketingMetadata,
  renderLocaleMarketingPage,
} from "@/lib/i18n/marketing-locale-page";

export const metadata = await getLocaleMarketingMetadata("ja");

export default async function JapaneseMarketingPage() {
  return renderLocaleMarketingPage("ja");
}
