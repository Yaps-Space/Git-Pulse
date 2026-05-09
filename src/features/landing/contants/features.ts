import { Github, Users, GitBranch, BrainCircuit } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface LandingFeature {
  icon: LucideIcon;
  title: string;
  desc: string;
  tags: string[];
}

export const LANDING_FEATURES: LandingFeature[] = [
  {
    icon: Github,
    title: "GitHub OAuth Login",
    desc: "Login aman menggunakan akun GitHub. Token tersimpan otomatis sehingga data repository langsung dapat diakses.",
    tags: ["GitHub OAuth", "Firebase Auth", "Secure Token"],
  },
  {
    icon: Users,
    title: "Team Space",
    desc: "Buat atau bergabung ke tim menggunakan kode undangan atau QR Code dengan sistem role otomatis.",
    tags: ["QR Code Invite", "Role Management", "Firestore"],
  },
  {
    icon: GitBranch,
    title: "Analisis Repository",
    desc: "Fetch data commit, issue, dan metadata repository langsung dari GitHub API untuk analisis mendalam.",
    tags: ["GitHub API", "Commit History", "Issue Tracking"],
  },
  {
    icon: BrainCircuit,
    title: "ML Scoring Otomatis",
    desc: "Tiga model Machine Learning menganalisis produktivitas, health score, dan status member secara otomatis.",
    tags: ["Produktivitas", "Health Score", "Member Status"],
  },
];