import { Zap, Flame, GitBranch, BrainCircuit, QrCode, ShieldCheck } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface LandingTech {
  icon: LucideIcon;
  name: string;
  desc: string;
}

export const LANDING_TECHS: LandingTech[] = [
  { icon: Zap, name: "Next.js", desc: "Framework React full-stack yang cepat dan modern" },
  { icon: Flame, name: "Firebase", desc: "Auth & Firestore sebagai backend dan autentikasi" },
  { icon: GitBranch, name: "GitHub API", desc: "Fetch commit, issue, dan metadata repository" },
  { icon: BrainCircuit, name: "Machine Learning", desc: "Tiga model ML: produktivitas, health score, member status" },
  { icon: QrCode, name: "QR Code System", desc: "Generate dan scan QR Code untuk invite anggota tim" },
  { icon: ShieldCheck, name: "Role-Based Access", desc: "Sistem akses berbasis peran Evaluator dan Contributor" },
];