"use client";

import { useIsMobile } from "@/shared/hooks/UseMobile";
import { AccountLayoutMobile } from "./AccountLayoutMobile";
import { AccountProfileCard } from "./AccountProfileCard";
import { AccountLogoutCard } from "./AccountLogoutCard";
import { AccountTeamsCard } from "./AccountTeamsCard";

interface AccountLayoutSwitcherProps {
  name:      string;
  username:  string;
  email:     string;
  avatar:    string;
  createdAt: string;
}

export function AccountLayoutSwitcher(props: AccountLayoutSwitcherProps) {
  const isMobile = useIsMobile();

  if (isMobile) return <AccountLayoutMobile {...props} />;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#1E3A5F" }}>Akun</h1>
        <p className="text-sm" style={{ color: "#888" }}>Informasi profil GitHub kamu</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className="space-y-4">
          <AccountProfileCard {...props} />
          <AccountLogoutCard />
        </div>
        <div className="space-y-4">
          <AccountTeamsCard />
        </div>
      </div>
    </div>
  );
}