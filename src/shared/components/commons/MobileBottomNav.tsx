"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, GitBranch, Users, UserCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Repository", href: "/repository", icon: GitBranch },
  { label: "Team Space", href: "/team-space", icon: Users },
  { label: "Akun", href: "/account", icon: UserCircle },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-white/8"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)" }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-4">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors",
                isActive ? "text-[#00d964]" : "text-white hover:text-white/60"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}