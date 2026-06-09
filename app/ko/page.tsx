import {
  getLocaleMarketingMetadata,
  renderLocaleMarketingPage,
} from "@/lib/i18n/marketing-locale-page";

export const metadata = await getLocaleMarketingMetadata("ko");

export default async function KoreanMarketingPage() {
  return renderLocaleMarketingPage("ko");
}
