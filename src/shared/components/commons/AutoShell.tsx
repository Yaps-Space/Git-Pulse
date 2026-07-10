"use client";

import { useEffect, useRef } from "react";
import { AppSidebar } from "@/shared/components/commons/Sidebar";
import { MobileDrawer } from "./MobileDrawer";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { useIsMobile } from "@/shared/hooks/UseMobile";
import { toast } from "sonner";

interface AuthShellProps {
  children: React.ReactNode;
  user: {
    name?:     string | null;
    email?:    string | null;
    image?:    string | null;
    username?: string | null;
  };
}

export function AuthShell({ children, user }: AuthShellProps) {
  const isMobile   = useIsMobile();
  const toastShown = useRef(false);

  useEffect(() => {
    if (toastShown.current) return;
    if (sessionStorage.getItem("showLoginToast") === "1") {
      toastShown.current = true;
      sessionStorage.removeItem("showLoginToast");
      toast.success(`Selamat datang kembali, ${user.name?.split(" ")[0] ?? "User"}!`);
    }
  }, [user.name]);

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-[#EBEBEB]">
        <MobileDrawer user={user} />
        <main className="flex-1 overflow-auto pt-14">
          {children}
        </main>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 overflow-auto bg-[#EBEBEB]">
          {children}
        </main>
      </SidebarProvider>
    </TooltipProvider>
  );
}