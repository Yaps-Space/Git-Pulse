"use client";

import { useIsMobile } from "@/shared/hooks/UseMobile";
import { useAccount } from "../hooks/UseAccount";
import { useTeams } from "../hooks/UseTeams";
import { AccountLayoutMobile } from "./AccountLayoutMobile";
import { AccountProfileCard } from "./AccountProfileCard";
import { AccountLogoutCard } from "./AccountLogoutCard";
import { AccountTeamsCard } from "./AccountTeamsCard";
import { PageShell } from "@/shared/components/commons/PageShell";
import { PageSkeleton } from "@/shared/components/commons/PageSkeleton";

export function AccountLayout() {
  const isMobile                             = useIsMobile();
  const { account, loading: loadingAccount } = useAccount();
  const { loading: loadingTeams }            = useTeams();

  if (loadingAccount || loadingTeams) return <PageSkeleton />;
  if (!account) return null;

  if (isMobile) return <AccountLayoutMobile {...account} />;

  return (
    <PageShell title="Account Settings">
      <div className="grid grid-cols-2 gap-4 items-stretch mb-1">
        <AccountProfileCard {...account} />
        <AccountTeamsCard />
      </div>
      <AccountLogoutCard />
    </PageShell>
  );
}