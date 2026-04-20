"use client";

import { useIsMobile } from "@/shared/hooks/UseMobile";
import { AccountLayoutMobile } from "./AccountLayoutMobile";
import { AccountProfileCard } from "./AccountProfileCard";
import { AccountLogoutCard } from "./AccountLogoutCard";
import { AccountTeamsCard } from "./AccountTeamsCard";
import { PageShell } from "@/shared/components/commons/PageShell";
import { AccountLayoutSwitcherProps } from "../types/LayoutSwitch";

export function AccountLayoutSwitcher(props: AccountLayoutSwitcherProps) {
  const isMobile = useIsMobile();

  if (isMobile) return <AccountLayoutMobile {...props} />;

  return (
    <PageShell title="Account Settings">
      <div className="grid grid-cols-2 gap-4 items-stretch mb-1">
        <AccountProfileCard {...props} />
        <AccountTeamsCard />
      </div>
      <AccountLogoutCard />
    </PageShell>
  );
}