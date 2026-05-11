"use client"

import { MobilePageHeader }       from "@/shared/components/commons/MobilePageHeader"
import { DashboardHeroCard }      from "./DashboardHeroCard"
import { DashboardStatCards }     from "./DashboardStatCards"
import { DashboardActivityChart } from "./DashboardActivityChart"
import { DashboardRepoSnapshot }  from "./DashboardRepoSnapshot"
import { DashboardTeamSnapshot }  from "./DashboardTeamSnapshot"
import { DashboardRepo }          from "../types"

interface Team {
  id:          string
  name:        string
  role:        string
  memberCount: number
}

interface Props {
  name:        string
  repos:       DashboardRepo[]
  teams:       Team[]
  activeRepos: number
  avgHealth:   number
}

export function DashboardMobile({ name, repos, teams, activeRepos, avgHealth }: Props) {
  return (
    <div className="min-h-screen">
      <MobilePageHeader title="">
        <DashboardHeroCard name={name} />
      </MobilePageHeader>

      <div className="px-4 pt-5 pb-6 flex flex-col gap-4">
        <DashboardStatCards
          totalRepos  ={repos.length}
          activeRepos ={activeRepos}
          totalTeams  ={teams.length}
          avgHealth   ={avgHealth}
        />

        <DashboardActivityChart repos={repos} />

        <div className="flex flex-col gap-4">
          <DashboardRepoSnapshot repos={repos} />
          <DashboardTeamSnapshot teams={teams} />
        </div>
      </div>
    </div>
  )
}