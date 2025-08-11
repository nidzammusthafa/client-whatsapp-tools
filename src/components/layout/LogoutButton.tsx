"use client";

import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const { logout, isLoggedIn } = useAuthStore();

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Button
      variant="destructive"
      size="icon"
      onClick={logout}
      aria-label="Logout"
      className="md:inline-flex"
    >
      <LogOut className="h-[1.2rem] w-[1.2rem]" />
    </Button>
  );
};
export default LogoutButton;
