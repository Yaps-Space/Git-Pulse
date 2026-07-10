"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarSeparator, useSidebar,
} from "@/shared/components/ui/sidebar";
import { cn } from "@/shared/lib/utils";
import { NAV_ITEMS } from "@/shared/contans/NavItems";

export function AppSidebar() {
  const pathname          = usePathname()
  const { state, toggleSidebar } = useSidebar()
  const { data: session } = useSession()
  const collapsed         = state === "collapsed"

  const user     = session?.user
  const initials = user?.name
    ?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "GP"

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/")

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-5 px-3">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="GitPulse" width={32} height={32} className="rounded-md flex-shrink-0" />
            {!collapsed && (
              <span className="text-sidebar-foreground font-bold text-base tracking-tight">
                Git<span className="text-[#00D964]">Pulse</span>
              </span>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={toggleSidebar}
              className="w-6 h-6 rounded-md flex items-center justify-center text-white/30 hover:bg-white/8 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="py-2">
        <SidebarMenu className="gap-1 px-2">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <SidebarMenuItem key={label}>
              <SidebarMenuButton
                asChild
                isActive={isActive(href)}
                tooltip={label}
                className={cn(
                  "h-10 font-medium text-sidebar-foreground/70",
                  isActive(href) && "!bg-[#00D964] !text-gray-900"
                )}
              >
                <Link href={href}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="py-3">
        <SidebarSeparator className="mb-2" />
        <SidebarMenu className="gap-1">
          {collapsed && (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Expand"
                onClick={toggleSidebar}
                className="h-10 text-white/30 hover:bg-white/8 hover:text-white mb-1"
              >
                <ChevronRight className="w-4 h-4" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/account"}
              tooltip={user?.name ?? "Akun"}
              className={cn(
                "h-12 text-sidebar-foreground/70",
                pathname === "/account" && "!bg-[#00D964] !text-gray-900"
              )}
            >
              <Link href="/account">
                <Avatar className="w-4 h-4 flex-shrink-0">
                  <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
                  <AvatarFallback className="bg-white/10 text-white text-[9px]">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="truncate leading-tight text-sm font-medium">{user?.name ?? "Akun"}</p>
                  <p className="text-xs truncate opacity-60">@{user?.username ?? ""}</p>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="h-10 text-white/40 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}