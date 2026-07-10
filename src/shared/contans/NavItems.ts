import { GitBranch, Home, Users } from "lucide-react";

export const NAV_ITEMS = [
  { label: "Dashboard",
    href: "/dashboard",
    icon: Home
  },
  { label: "Repository",
    href: "/repository",
    icon: GitBranch
  },
  { label: "Team Space", 
    href: "/team-space", 
    icon: Users     
  },
];