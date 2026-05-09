"use client";

import { useState } from "react";
import { Sidebar } from "@/shared/components/commons/Sidebar";
import { MobileBottomNav } from "@/shared/components/commons/MobileBottomNav";
import { useIsMobile } from "@/shared/hooks/UseMobile";

interface AuthShellProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
  };
}

export function AuthShell({ children, user }: AuthShellProps) {
  const isMobile = useIsMobile();
  const [manualCollapsed, setManualCollapsed] = useState<boolean | undefined>(undefined);

  const collapsed = manualCollapsed ?? false;

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-[#EBEBEB]">
        <main className="flex-1 overflow-auto pb-20">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#EBEBEB]">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setManualCollapsed((prev) => !(prev ?? false))}
        user={user}
      />
      <main
        className="flex-1 overflow-auto transition-all duration-300"
        style={{ marginLeft: collapsed ? "4rem" : "14rem" }}
      >
        {children}
      </main>
    </div>
  );
}