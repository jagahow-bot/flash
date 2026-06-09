import {
  getLocaleMarketingMetadata,
  renderLocaleMarketingPage,
} from "@/lib/i18n/marketing-locale-page";

export const metadata = await getLocaleMarketingMetadata("fr");

export default async function FrenchMarketingPage() {
  return renderLocaleMarketingPage("fr");
}
