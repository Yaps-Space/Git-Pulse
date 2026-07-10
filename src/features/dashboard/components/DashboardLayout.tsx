"use client"

import { useIsMobile }          from "@/shared/hooks/UseMobile"
import { useDashboardRepos, useDashboardTeams } from "../hooks/useDashboard"
import { DashboardHeroCard }    from "./DashboardHeroCard"
import { DashboardStatCards }   from "./DashboardStatCards"
import { DashboardActivityChart } from "./DashboardActivityChart"
import { DashboardCodeChanges }     from "./DashboardCodeChanges"
import { DashboardWorkflowInsights } from "./DashboardWorkflowInsights"
import { DashboardRepoSnapshot } from "./DashboardRepoSnapshot"
import { DashboardTeamSnapshot } from "./DashboardTeamSnapshot"
import { DashboardMobile }      from "./DashboardMobile"
import { PageShell }            from "@/shared/components/commons/PageShell"
import { PageSkeleton }         from "@/shared/components/commons/PageSkeleton"

interface Props {
  name: string
}

export function DashboardLayout({ name }: Props) {
  const isMobile                         = useIsMobile()
  const { repos, loading: loadingRepos } = useDashboardRepos()
  const { teams, loading: loadingTeams } = useDashboardTeams()

  if (loadingRepos || loadingTeams) return <PageSkeleton />

  const activeRepos = repos.filter(r => r.productivityState === "ACTIVE").length
  const avgHealth   = repos.length > 0
    ? Math.round(repos.reduce((sum, r) => sum + (r.healthScore ?? 0), 0) / repos.length)
    : 0

  if (isMobile) return (
    <DashboardMobile
      name        ={name}
      repos       ={repos}
      teams       ={teams}
      activeRepos ={activeRepos}
      avgHealth   ={avgHealth}
    />
  )

  return (
    <PageShell title="Dashboard">
      <div className="flex flex-col gap-4">
        <DashboardHeroCard name={name} />

        <DashboardStatCards
          totalRepos  ={repos.length}
          activeRepos ={activeRepos}
          totalTeams  ={teams.length}
          avgHealth   ={avgHealth}
        />

        <DashboardActivityChart repos={repos} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DashboardCodeChanges      repos={repos} />
          <DashboardWorkflowInsights repos={repos} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DashboardRepoSnapshot repos={repos} />
          <DashboardTeamSnapshot teams={teams} />
        </div>
      </div>
    </PageShell>
  )
}