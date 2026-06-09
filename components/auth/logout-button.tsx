"use client";

import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useAppDictionaryOptional } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";

type LogoutButtonProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  redirectTo?: string;
};

export function LogoutButton({
  redirectTo = "/",
  children,
  variant = "outline",
  size = "sm",
  ...props
}: LogoutButtonProps) {
  const dict = useAppDictionaryOptional();
  const router = useRouter();
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleSignOut}
      {...props}
    >
      {children ?? dict?.common.logout ?? "Log out"}
    </Button>
  );
}
