"use client";

import { useIsMobile } from "@/shared/hooks/UseMobile";
import { useTeamSpaceDetail } from "../hooks/useTeamSpaceDetail";
import { PageShell } from "@/shared/components/commons/PageShell";
import { PageSkeleton } from "@/shared/components/commons/PageSkeleton";
import TeamSpaceDetailView from "./TeamSpaceDetailView";
import { TeamSpaceDetailMobile } from "./TeamSpaceDetailMobile";

interface Props {
  id: string;
}

export function TeamSpaceDetailLayout({ id }: Props) {
  const isMobile        = useIsMobile();
  const { detail, loading, refresh } = useTeamSpaceDetail(id);

  if (loading) return <PageSkeleton />;
  if (!detail) return null;

  if (isMobile) return (
    <TeamSpaceDetailMobile detail={detail} onMutate={refresh} />
  )

  return (
    <PageShell title="Team Space" detail={detail.name}>
      <TeamSpaceDetailView id={id} />
    </PageShell>
  );
}