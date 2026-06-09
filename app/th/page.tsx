import {
  getLocaleMarketingMetadata,
  renderLocaleMarketingPage,
} from "@/lib/i18n/marketing-locale-page";

export const metadata = await getLocaleMarketingMetadata("th");

export default async function ThaiMarketingPage() {
  return renderLocaleMarketingPage("th");
}
