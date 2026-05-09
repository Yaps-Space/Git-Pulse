import { Crown, GraduationCap, Code2 } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface LandingRole {
  icon: LucideIcon;
  name: string;
  badge: string;
  badgeColor: string;
  perms: string[];
}

export const LANDING_ROLES: LandingRole[] = [
  {
    icon: Crown,
    name: "Owner",
    badge: "Create Team",
    badgeColor: "bg-yellow-100 text-yellow-700",
    perms: [
      "Hapus Team Space",
      "Promote / demote semua member",
      "Lihat semua data & laporan ML",
    ],
  },
  {
    icon: GraduationCap,
    name: "Evaluator",
    badge: "Di-promote",
    badgeColor: "bg-blue-100 text-blue-700",
    perms: [
      "Lihat semua member & data lengkap",
      "Promote Contributor jadi Evaluator",
      "Kick member dari tim",
    ],
  },
  {
    icon: Code2,
    name: "Contributor",
    badge: "Join Team",
    badgeColor: "bg-green-100 text-green-700",
    perms: [
      "Lihat data & skor ML diri sendiri",
      "Bergabung tim via QR Code / invite",
      "Keluar sendiri dari tim",
    ],
  },
];

export const LANDING_TEAM_PREVIEW = [
  { initials: "J", name: "James", role: "Owner", score: 94, bg: "bg-yellow-500" },
  { initials: "JU", name: "Justin", role: "Evaluator", score: 87, bg: "bg-blue-600"   },
  { initials: "DA", name: "Dinda Atikah", role: "Contributor", score: 82, bg: "bg-orange-500" },
  { initials: "LS", name: "Latifa Salsabila", role: "Contributor", score: 82, bg: "bg-purple-600" },
];