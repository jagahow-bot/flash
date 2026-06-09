import {
  getLocaleMarketingMetadata,
  renderLocaleMarketingPage,
} from "@/lib/i18n/marketing-locale-page";

export const metadata = await getLocaleMarketingMetadata("es");

export default async function SpanishMarketingPage() {
  return renderLocaleMarketingPage("es");
}
