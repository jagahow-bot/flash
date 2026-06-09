import { SiteHeader } from "@/components/marketing/site-header";

export default function AuthLayout({
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
