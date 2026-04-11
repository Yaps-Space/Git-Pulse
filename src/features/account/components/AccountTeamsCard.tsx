import { Badge } from "@/shared/components/ui/badge";
import { Users } from "lucide-react";
import { DUMMY_TEAMS } from "../constants/DummyTeams";

const ROLE_CONFIG = {
  owner:       { label: "Owner",       className: "bg-yellow-100 text-yellow-700" },
  evaluator:   { label: "Evaluator",   className: "bg-blue-100 text-blue-700"     },
  contributor: { label: "Contributor", className: "bg-green-100 text-green-700"   },
} as const;

type Role = keyof typeof ROLE_CONFIG;

export function AccountTeamsCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-900">Tim yang Diikuti</h3>
        <span className="text-xs text-gray-400">{DUMMY_TEAMS.length} tim</span>
      </div>

      <div className="space-y-3">
        {DUMMY_TEAMS.map(({ id, name, role, memberCount }) => {
          const { label, className } = ROLE_CONFIG[role as Role];
          return (
            <div key={id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-colors">
              <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-[#00d964]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                <p className="text-xs text-gray-400">{memberCount} anggota</p>
              </div>
              <Badge className={`${className} border-0 text-xs flex-shrink-0`}>
                {label}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}