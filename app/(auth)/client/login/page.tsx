import { redirect } from "next/navigation";

export default async function ClientLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectTo } = await searchParams;
  const params = redirectTo
    ? `?redirect=${encodeURIComponent(redirectTo)}`
    : "";
  redirect(`/login${params}`);
}
