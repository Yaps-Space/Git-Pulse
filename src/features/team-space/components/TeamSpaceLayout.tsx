"use client";

import { useIsMobile } from "@/shared/hooks/UseMobile";
import { useTeamSpaces } from "../hooks/useTeamSpaces";
import { PageShell } from "@/shared/components/commons/PageShell";
import { PageSkeleton } from "@/shared/components/commons/PageSkeleton";
import TeamSpaceListView from "./TeamSpaceListView";
import TeamSpaceListMobile from "./TeamSpaceListMobile";

export function TeamSpaceLayout() {
  const isMobile            = useIsMobile();
  const { loading }         = useTeamSpaces();

  if (loading) return <PageSkeleton />;

  if (isMobile) return <TeamSpaceListMobile />;

  return (
    <PageShell title="Team Space">
      <TeamSpaceListView />
    </PageShell>
  );
}