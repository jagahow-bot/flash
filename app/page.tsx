import {
  getDefaultMarketingMetadata,
  renderDefaultMarketingPage,
} from "@/lib/i18n/marketing-locale-page";

export const generateMetadata = getDefaultMarketingMetadata;

export default async function HomePage() {
  return renderDefaultMarketingPage();
}
