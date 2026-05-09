import { Crown, GraduationCap, Code2 } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface LoginRole {
  icon: LucideIcon;
  name: string;
  how:  string;
  badge: string;
}

export const LOGIN_ROLES: LoginRole[] = [
  {
    icon: Crown,
    name: "Owner",
    how: "Buat Team Space baru",
    badge: "Create Team",
  },
  {
    icon: GraduationCap,
    name: "Evaluator",
    how: "Di-promote oleh Owner",
    badge: "Promoted",
  },
  {
    icon: Code2,
    name: "Contributor",
    how: "Join via QR Code",
    badge: "Join Team",
  },
];