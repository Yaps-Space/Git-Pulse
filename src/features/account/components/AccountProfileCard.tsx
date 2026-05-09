"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import { Github } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { AccountProfileCardProps } from "../types/Profile";
import { INFO_ITEMS } from "../constants/ProfileIcon";
import { useIsMobile } from "@/shared/hooks/UseMobile";

export function AccountProfileCard({ name, username, email, avatar, createdAt }: AccountProfileCardProps) {
  const isMobile = useIsMobile();
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      {!isMobile && (
        <>
          <div className="flex items-center gap-4 mb-1">
            <Avatar className="w-12 h-12 border-1 border-gray-100 flex-shrink-0">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="bg-gray-900 text-white text-sm font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-gray-900">{name}</h2>
              <p className="text-sm text-gray-400">@{username}</p>
            </div>
          </div>
          <Separator className="my-4.5" />
        </>
      )}

      <div className={isMobile ? "space-y-3" : "space-y-4 mb-7.5"}>
        {INFO_ITEMS(username, email, createdAt).map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">{label}</p>
              <p className="text-sm font-medium text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <Separator className={isMobile ? "my-4" : "my-7.5"} />

      <Button
        asChild
        className="w-full gap-2 font-medium hover:opacity-90 transition-opacity"
        style={{ background: "#00d964", color: "#000000" }}
      >
        <a href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer">
          <Github className="w-4 h-4" />
          Lihat profile di GitHub
        </a>
      </Button>
    </div>
  );
}