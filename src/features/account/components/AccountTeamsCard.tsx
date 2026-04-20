import { Users, ChevronRight } from "lucide-react";
import { Separator } from "@/shared/components/ui/separator";
import { DUMMY_TEAMS, ROLE_CONFIG } from "../constants/DummyTeams";
import Link from "next/link";

type Role = keyof typeof ROLE_CONFIG;

const MAX_VISIBLE = 4;

export function AccountTeamsCard() {
  const visibleTeams = DUMMY_TEAMS.slice(0, MAX_VISIBLE);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900">Team yang diikuti</h3>
        </div>
        <Link href="/team-space" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          See All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex items-center gap-1 mb-4.5">
        <Users className="w-3 h-3 text-gray-400" />
        <p className="text-sm text-gray-400">{DUMMY_TEAMS.length} team</p>
      </div>

      <Separator className="mb-5" />

      <div className="space-y-2">
        {visibleTeams.map(({ id, name, role, memberCount }) => {
          const config = ROLE_CONFIG[role as Role];
          return (
            <div key={id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                <p className="text-sm text-gray-400">{memberCount} members</p>
              </div>
              <span
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full flex-shrink-0 ml-3"
                style={{ background: config.bg, color: config.text }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: config.dot }} />
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}