"use client";

import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Github, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { LOGIN_ROLES } from "../constans/roles";

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4";

export function LoginLayout() {
  const handleLogin = () => {
    signIn("github", { callbackUrl: "/dashboard" }, { prompt: "select_account" });
  };

  return (
    <main className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-black">
      <video
        src={VIDEO_URL}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="absolute inset-0 bg-black/60 z-[1]" />

      <div className="relative z-10 w-full max-w-[400px] px-4 flex flex-col items-center gap-4">
        <Card
          className="w-full border-0 px-6 py-9"
          style={{
            background:           "rgba(255,255,255,0.04)",
            backdropFilter:       "blur(50px)",
            WebkitBackdropFilter: "blur(50px)",
            boxShadow:            "4px 4px 4px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.12)",
            outline:              "0.5px solid rgba(255,255,255,0.12)",
          }}
        >
          <CardHeader className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="GitPulse" width={28} height={28} className="rounded-md flex-shrink-0" />
              <span className="font-bold text-white text-base">Git<span className="text-[#00d964]">Pulse</span></span>
            </div>
            <h2 className="text-xl font-semibold text-white leading-tight">Masuk ke GitPulse</h2>
            <p className="text-white/45 text-xs leading-relaxed mt-2 max-w-[260px]">
              Role ditentukan otomatis — buat tim jadi Owner, gabung tim jadi Contributor.
            </p>
          </CardHeader>

          <CardContent className="pb-3">
            <div className="grid grid-cols-3 gap-2">
              {LOGIN_ROLES.map(({ icon: Icon, name, how, badge }) => (
                <div
                  key={name}
                  className="text-center p-3 rounded-xl border border-white/8 bg-white/[0.02] hover:border-white/15 transition-colors flex flex-col items-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center mb-2">
                    <Icon className="w-5 h-5 text-white/60" />
                  </div>
                  <p className="text-white text-xs font-medium mb-1">{name}</p>
                  <p className="text-white/35 text-[10px] leading-tight mb-2">{how}</p>
                  <Badge variant="secondary" className="text-[9px] px-2 py-0.5 bg-white/8 text-white/40 border border-white/10 rounded-full">
                    {badge}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
          <Button
            onClick={handleLogin}
            className="w-full gap-2 text-sm font-medium text-gray-900 border-0 hover:brightness-110 active:brightness-95 transition-all"
            style={{
              background: "#00d964",
              boxShadow:  "0 0 20px rgba(0,217,100,0.3), inset 0 1px 1px rgba(255,255,255,0.3)",
            }}>
            <Github className="w-4 h-4" />
              Login With GitHub
            </Button>
        </Card>

        <Link
          href="/"
          className="flex items-center gap-1 text-white/50 hover:text-white text-sm font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Link>
      </div>
    </main>
  );
}