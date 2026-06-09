import {
  getLocaleMarketingMetadata,
  renderLocaleMarketingPage,
} from "@/lib/i18n/marketing-locale-page";

export const metadata = await getLocaleMarketingMetadata("pt-BR");

export default async function PortugueseMarketingPage() {
  return renderLocaleMarketingPage("pt-BR");
}
