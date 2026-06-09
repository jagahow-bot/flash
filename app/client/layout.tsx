import { SiteHeader } from "@/components/marketing/site-header";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      {children}
    </div>
  );
}
