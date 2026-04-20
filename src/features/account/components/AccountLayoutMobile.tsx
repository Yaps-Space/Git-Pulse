"use client";

import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Github, Users, LogOut } from "lucide-react";
import { useTeams } from "../hooks/UseTeams";
import { AccountLayoutSwitcherProps } from "../types/LayoutSwitch";
import { ROLE_CONFIG } from "../constants/RoleTeams";
import { INFO_ITEMS } from "../constants/ProfileIcon";
import { TeamSkeleton } from "./TeamsSkeleton";
import { EmptyTeams } from "./EmptyTeams";

type Role = keyof typeof ROLE_CONFIG;

export function AccountLayoutMobile({ name, username, email, avatar, createdAt }: AccountLayoutSwitcherProps) {
  const { teams, loading } = useTeams();

  const initials  = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const infoItems = INFO_ITEMS(username, email, createdAt);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 px-5 pt-10 pb-10 rounded-b-3xl">
        <p className="text-gray-400 font-bold mb-4">Profil Akun</p>
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-white/20">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-[#00d964] text-gray-900 text-lg font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-white font-bold">{name}</h1>
            <p className="text-gray-400 text-sm">@{username}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 pb-6 space-y-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-gray-900">Informasi Akun</h3>
          {infoItems.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-900">{value}</p>
              </div>
            </div>
          ))}
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm transition-colors mt-2"
            style={{ background: "#00d964", color: "#000000" }}
          >
            <Github className="w-4 h-4" />
            Lihat profil di GitHub
          </a>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Tim yang Diikuti</h3>
            <span className="text-xs text-gray-400">
              {loading ? "..." : `${teams.length} tim`}
            </span>
          </div>

          {loading ? (
            <TeamSkeleton />
          ) : teams.length === 0 ? (
            <EmptyTeams />
          ) : (
            <div className="space-y-2">
              {teams.map(({ id, name, role, memberCount }) => {
                const config = ROLE_CONFIG[role as Role] ?? ROLE_CONFIG.contributor;
                return (
                  <div key={id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                    <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-3.5 h-3.5 text-[#00d964]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                      <p className="text-xs text-gray-400">{memberCount} anggota</p>
                    </div>
                    <span
                      className="border-0 text-[10px] px-1.5 py-0.5 flex-shrink-0 rounded-full font-medium"
                      style={{ background: config.bg, color: config.text }}
                    >
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h3 className="font-bold text-gray-900 mb-1">Keluar dari GitPulse</h3>
          <p className="text-sm text-gray-500 mb-4">
            Kamu akan keluar dari sesi ini. Data tetap tersimpan dan bisa diakses kembali setelah login.
          </p>
          <Button
            className="w-full gap-2 text-white font-medium hover:opacity-90 transition-opacity"
            style={{ background: "#BB230B" }}
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}