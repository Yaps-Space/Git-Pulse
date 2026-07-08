import { Users, GitBranch, BrainCircuit, QrCode, UserCheck } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface LandingFeature {
  icon:    LucideIcon;
  title:   string;
  desc:    string;
  tags:    string[];
  primary: boolean;
}

export const LANDING_FEATURES: LandingFeature[] = [
  {
    icon:    Users,
    title:   "Team Space",
    desc:    "Bentuk ruang kerja tim untuk proyek PBL dengan peran Owner, Evaluator, dan Contributor. Evaluator dan Owner bisa memantau seluruh kontribusi anggota secara real-time, sementara Contributor hanya melihat data dirinya sendiri. Evaluasi jadi terstruktur, terukur, dan bebas bias.",
    tags:    ["Role-Based Access", "Evaluasi PBL", "Member Analytics", "Real-time"],
    primary: true,
  },
  {
    icon:    BrainCircuit,
    title:   "ML Scoring Otomatis",
    desc:    "Tiga model Machine Learning menganalisis status member (Active/Moderate/Inactive), produktivitas repository (Active/Inactive), dan health score secara otomatis tanpa intervensi manual.",
    tags:    ["Member Status", "Produktivitas Repo", "Health Score"],
    primary: true,
  },
  {
    icon:    GitBranch,
    title:   "Analisis Repository",
    desc:    "Fetch data commit, issue, PR, dan code changes langsung dari GitHub & GitLab API. Setiap repo mendapat health score dan label produktivitas berbasis data nyata.",
    tags:    ["GitHub API", "GitLab API", "Commit History", "Health Score"],
    primary: true,
  },
  {
    icon:    QrCode,
    title:   "QR Code & Kode Undangan",
    desc:    "Ajak anggota baru untuk bergabung ke Team Space dengan dua cara: scan QR Code atau ketik kode undangan secara manual.",
    tags:    ["QR Code", "Kode Undangan", "Akses Cepat", "User-friendly"],
    primary: true,
  },
]