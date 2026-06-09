import { ClientPageChrome } from "@/components/client/client-page-chrome";

export default function StudioSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ClientPageChrome />
      {children}
    </>
  );
}
