"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/shared/components/ui/button";
import { LogOut } from "lucide-react";

export function AccountLogoutCard() {
  return (
    <div className="bg-white border border-red-100 rounded-2xl p-6">
      <h3 className="font-bold text-gray-900 mb-1">Keluar dari GitPulse</h3>
      <p className="text-sm text-gray-500 mb-4">
        Kamu akan keluar dari sesi ini. Data tetap tersimpan dan bisa diakses kembali setelah login.
      </p>
      <Button
        variant="destructive"
        className="w-full gap-2"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </div>
  );
}