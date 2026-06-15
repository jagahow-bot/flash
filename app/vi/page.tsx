import {
  getLocaleMarketingMetadata,
  renderLocaleMarketingPage,
} from "@/lib/i18n/marketing-locale-page";

export const metadata = await getLocaleMarketingMetadata("vi");

export default async function VietnameseMarketingPage() {
  return renderLocaleMarketingPage("vi");
}
