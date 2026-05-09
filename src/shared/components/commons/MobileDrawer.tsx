"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle } from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";
import { NAV_ITEMS } from "@/shared/contans/NavItems";
import { SidebarProps } from "@/shared/types/Sidebar";
import { useState } from "react";

export function MobileDrawer({ user }: SidebarProps) {
  const pathname        = usePathname();
  const [open, setOpen] = useState(false);

  const initials = user?.name
    ?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "GP";

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 border-b border-white/8"
        style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)" }}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo.png" alt="GitPulse" width={28} height={28} className="rounded-md" />
          <span className="text-white font-bold text-base tracking-tight">
            Git<span className="text-[#00D964]">Pulse</span>
          </span>
        </Link>

        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-md text-white/70 hover:bg-white/8 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-64 p-0 border-l border-white/8 [&>button]:hidden"
          style={{ background: "rgba(0,0,0,0.97)", backdropFilter: "blur(20px)" }}
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>

          <div className="flex flex-col h-full py-5 px-3">
            <div className="flex items-center justify-between px-1 mb-5">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <Image src="/logo.png" alt="GitPulse" width={28} height={28} className="rounded-md" />
                <span className="text-white font-bold text-base tracking-tight">
                  Git<span className="text-[#00D964]">Pulse</span>
                </span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-md text-white/30 hover:bg-white/8 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 flex-1">
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    pathname === href
                      ? "bg-[#00D964] text-gray-900"
                      : "text-white/70 hover:bg-white/8 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-1 border-t border-white/8 pt-3">
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  pathname === "/account"
                    ? "bg-[#00D964] text-gray-900"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                )}
              >
                <Avatar className="w-6 h-6 flex-shrink-0">
                  <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
                  <AvatarFallback className="bg-white/10 text-white text-[9px]">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="truncate leading-tight">{user?.name ?? "Akun"}</p>
                  <p className="text-xs truncate opacity-60">@{user?.username ?? ""}</p>
                </div>
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                Logout
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}