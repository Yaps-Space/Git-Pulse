"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Home, GitBranch, Users, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard",  href: "/dashboard",  icon: Home      },
  { label: "Repository", href: "/repository", icon: GitBranch },
  { label: "Team Space", href: "/team-space", icon: Users     },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle:  () => void;
  user: {
    name?:     string | null;
    email?:    string | null;
    image?:    string | null;
    username?: string | null;
  };
}

export function Sidebar({ collapsed, onToggle, user }: SidebarProps) {
  const pathname = usePathname();

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "GP";

  const accountItem = (
    <Link
      href="/account"
      className={cn(
        "flex items-center gap-3 rounded-md text-sm font-medium transition-all duration-200",
        collapsed ? "w-10 h-10 justify-center mx-auto" : "px-3 py-2.5",
        pathname === "/account"
          ? "bg-[#00d964] text-gray-900"
          : "text-white/70 hover:bg-white/8 hover:text-white"
      )}
    >
      <Avatar className="w-6 h-6 flex-shrink-0">
        <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "User"} />
        <AvatarFallback className="bg-white/10 text-white text-[9px]">{initials}</AvatarFallback>
      </Avatar>
      {!collapsed && (
        <div className="flex-1 min-w-0">
          <p className="truncate leading-tight">{user?.name ?? "Akun"}</p>
          <p className="text-xs truncate opacity-60">@{user?.username ?? ""}</p>
        </div>
      )}
    </Link>
  );

  const logoutItem = (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={cn(
        "flex items-center gap-3 rounded-md text-sm font-medium transition-all duration-200 text-white/40 hover:bg-red-500/10 hover:text-red-400",
        collapsed ? "w-10 h-10 justify-center mx-auto" : "px-3 py-2.5"
      )}
    >
      <LogOut className="w-4 h-4 flex-shrink-0" />
      {!collapsed && "Logout"}
    </button>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen flex flex-col py-5 px-3 z-40 transition-all duration-300 border-r border-white/8",
          collapsed ? "w-16" : "w-56",
        )}
        style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)" }}
      >
        <div className={cn("flex items-center px-1", collapsed ? "justify-center" : "justify-between")}>
          <Link href="/dashboard" className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
            <Image src="/logo.png" alt="GitPulse" width={32} height={32} className="rounded-md flex-shrink-0" />
            {!collapsed && (
              <span className="text-white font-bold text-base tracking-tight">
                Git<span className="text-[#00d964]">Pulse</span>
              </span>
            )}
          </Link>

          {!collapsed && (
            <button
              onClick={onToggle}
              className="w-6 h-6 rounded-md flex items-center justify-center text-white/30 hover:bg-white/8 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        <Separator className="bg-white/8 my-5" />

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;

            const navItem = (
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-md text-sm font-medium transition-all duration-200",
                  collapsed ? "w-10 h-10 justify-center mx-auto" : "px-3 py-2.5",
                  isActive
                    ? "bg-[#00d964] text-gray-900"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && label}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={label}>
                  <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                  <TooltipContent side="right"><p>{label}</p></TooltipContent>
                </Tooltip>
              );
            }

            return <div key={label}>{navItem}</div>;
          })}
        </nav>

        <div className="flex flex-col gap-1">
          {collapsed && (
            <button
              onClick={onToggle}
              className="w-10 h-10 rounded-md flex items-center justify-center mx-auto text-white/30 hover:bg-white/8 hover:text-white transition-colors mb-1"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <Separator className="bg-white/8 mb-2" />

          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>{accountItem}</TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-semibold">{user?.name ?? "Akun"}</p>
                <p className="text-muted-foreground text-xs">@{user?.username ?? ""}</p>
              </TooltipContent>
            </Tooltip>
          ) : accountItem}

          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>{logoutItem}</TooltipTrigger>
              <TooltipContent side="right"><p>Logout</p></TooltipContent>
            </Tooltip>
          ) : logoutItem}
        </div>
      </aside>
    </TooltipProvider>
  );
}