"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { AccountProfileCard } from "./AccountProfileCard";
import { AccountLogoutCard } from "./AccountLogoutCard";
import { AccountData } from "../types/Account";
import { MobilePageHeader } from "@/shared/components/commons/MobilePageHeader";

export function AccountLayoutMobile({ name, username, email, avatar, createdAt, linkedProviders, hasPassword }: AccountData) {
  const [displayName, setDisplayName] = useState(name)
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen">
      <MobilePageHeader title="Profil Akun">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-white/20">
            <AvatarImage src={avatar} alt={displayName} />
            <AvatarFallback className="bg-[#00d964] text-gray-900 text-lg font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-white font-bold">{displayName}</h1>
            <p className="text-gray-400 text-sm">@{username}</p>
          </div>
        </div>
      </MobilePageHeader>

      <div className="px-4 pt-5 pb-6 space-y-4">
        <AccountProfileCard
          name            ={name}
          username        ={username}
          email           ={email}
          avatar          ={avatar}
          createdAt       ={createdAt}
          linkedProviders ={linkedProviders}
          hasPassword     ={hasPassword}
          onNameChange    ={setDisplayName}
        />
        <AccountLogoutCard />
      </div>
    </div>
  );
}