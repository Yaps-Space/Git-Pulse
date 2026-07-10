import { LogIn, Users, GitBranch, BrainCircuit } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface LandingStep {
  num:   string;
  icon:  LucideIcon;
  title: string;
  desc:  string;
}

export const LANDING_STEPS: LandingStep[] = [
  {
    num:   "1",
    icon:  LogIn,
    title: "Login ke GitPulse",
    desc:  "Masuk menggunakan akun GitHub, GitLab, atau daftar dengan email dan password.",
  },
  {
    num:   "2",
    icon:  Users,
    title: "Buat atau Gabung Team Space",
    desc:  "Buat Team Space sebagai Owner, atau scan QR Code / masukkan kode undangan sebagai Contributor. Username GitHub/GitLab tiap anggota otomatis terhubung ke nama aslinya.",
  },
  {
    num:   "3",
    icon:  GitBranch,
    title: "Connect Repository",
    desc:  "Hubungkan repository GitHub atau GitLab. GitPulse otomatis fetch data commit, issue, dan PR.",
  },
  {
    num:   "4",
    icon:  BrainCircuit,
    title: "Evaluasi Kontribusi Tim",
    desc:  "Owner dan Evaluator melihat health score repository, status produktivitas, dan kontribusi tiap anggota secara objektif dan terukur.",
  },
];