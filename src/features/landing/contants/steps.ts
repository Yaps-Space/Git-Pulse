import { Github, Users, BrainCircuit, GitBranch } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface LandingStep {
  num: string;
  icon: LucideIcon;
  title: string;
  desc: string;
}

export const LANDING_STEPS: LandingStep[] = [
  { num: "1", icon: Github, title: "Login dengan GitHub", desc: "Autentikasi menggunakan akun GitHub. Token tersimpan otomatis." },
  { num: "2", icon: Users, title: "Buat atau Gabung Tim", desc: "Buat Team Space sebagai Evaluator, atau scan QR Code sebagai Contributor." },
  { num: "3", icon: GitBranch, title: "Analisis Repository", desc: "Pilih repository dan biarkan GitPulse mengambil data dari GitHub API." },
  { num: "4", icon: BrainCircuit, title: "Lihat Skor ML", desc: "Dapatkan laporan produktivitas, health score, dan status member tim." },
];