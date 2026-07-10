"use client";

import { useIsMobile } from "@/shared/hooks/UseMobile";
import { useAccount } from "../hooks/UseAccount";
import { AccountLayoutMobile } from "./AccountLayoutMobile";
import { AccountProfileCard } from "./AccountProfileCard";
import { AccountLogoutCard } from "./AccountLogoutCard";
import { PageShell } from "@/shared/components/commons/PageShell";
import { PageSkeleton } from "@/shared/components/commons/PageSkeleton";

export function AccountLayout() {
  const isMobile                             = useIsMobile();
  const { account, loading: loadingAccount } = useAccount();

  if (loadingAccount) return <PageSkeleton />;
  if (!account) return null;

  if (isMobile) return <AccountLayoutMobile {...account} />;

  return (
    <PageShell title="Account Settings">
      <div className="grid grid-cols-3 gap-4 items-start">
        <div className="col-span-2">
          <AccountProfileCard {...account} />
        </div>
        <div className="col-span-1">
          <AccountLogoutCard />
        </div>
      </div>
    </PageShell>
  );
}