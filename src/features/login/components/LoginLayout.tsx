"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Github, ChevronLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4";

function GitLabIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51 1.22 3.78a.84.84 0 0 1-.3.92z" />
    </svg>
  );
}

// Shared button style baseline — ensures consistent height across all buttons
const oauthBtnBase: React.CSSProperties = {
  height:       "42px",
  borderRadius: "10px",
  fontSize:     "13.5px",
  fontWeight:   500,
};

export function LoginLayout() {
  const [login, setLogin]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleGithubLogin = () => {
    signIn("github", { callbackUrl: "/dashboard" }, { prompt: "select_account" });
  };

  const handleGitlabLogin = () => {
    signIn("gitlab", { callbackUrl: "/dashboard" });
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      login,
      password,
      redirect:    false,
      callbackUrl: "/dashboard",
    });

    setLoading(false);

    if (result?.error) {
      setError("Email/username atau password salah.");
      return;
    }

    if (result?.url) window.location.href = result.url;
  };

  const inputStyle = {
    background:   "rgba(255,255,255,0.05)",
    border:       "0.5px solid rgba(255,255,255,0.12)",
    color:        "white",
    borderRadius: "10px",
    padding:      "10px 14px",
    fontSize:     "13.5px",
    width:        "100%",
    outline:      "none",
    transition:   "border-color 0.15s",
  } as React.CSSProperties;

  return (
    <main className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Background video */}
      <video
        src={VIDEO_URL}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="absolute inset-0 bg-black/60 z-[1]" />

      {/* Back button — top left, consistent with register */}
      <Link
        href="/"
        className="absolute top-5 left-5 z-20 flex items-center gap-1.5 text-white/45 hover:text-white/80 text-sm font-medium transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Card — wider */}
      <div className="relative z-10 w-full max-w-[460px] px-4">
        <Card
          className="w-full border-0 px-8 py-8"
          style={{
            background:           "rgba(255,255,255,0.04)",
            backdropFilter:       "blur(50px)",
            WebkitBackdropFilter: "blur(50px)",
            boxShadow:            "4px 4px 4px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.08)",
            outline:              "0.5px solid rgba(255,255,255,0.12)",
            borderRadius:         "18px",
          }}
        >
          <CardHeader className="flex flex-col items-center text-center pb-5 px-0">
            <div className="flex items-center gap-2 mb-5">
              <Image
                src="/logo.png"
                alt="GitPulse"
                width={28}
                height={28}
                className="rounded-md flex-shrink-0"
              />
              <span className="font-bold text-white text-base">
                Git<span className="text-[#00d964]">Pulse</span>
              </span>
            </div>
            <h2 className="text-xl font-semibold text-white leading-tight tracking-tight">
              Masuk ke GitPulse
            </h2>
            <p className="text-white/35 text-xs mt-2 max-w-[280px] leading-relaxed">
              Kelola dan pantau aktivitas Git tim kamu dalam satu dashboard.
            </p>
          </CardHeader>

          <CardContent className="px-0 pb-0">
            {/* Credentials form — on top */}
            <form onSubmit={handleCredentialsLogin} className="flex flex-col gap-3">
              <div>
                <label className="text-white/45 text-[11.5px] font-medium mb-1.5 block">
                  Email atau Username
                </label>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="nama@email.com atau username"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,217,100,0.45)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                />
              </div>

              <div>
                <label className="text-white/45 text-[11.5px] font-medium mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ ...inputStyle, paddingRight: "40px" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,217,100,0.45)")}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position:   "absolute",
                      right:      "11px",
                      top:        "50%",
                      transform:  "translateY(-50%)",
                      color:      "rgba(255,255,255,0.3)",
                      background: "none",
                      border:     "none",
                      cursor:     "pointer",
                      padding:    0,
                      display:    "flex",
                    }}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  className="text-red-400 text-xs text-center py-1.5 px-3 rounded-lg"
                  style={{ background: "rgba(239,68,68,0.1)" }}
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full gap-2 text-sm font-semibold text-[#0a1a0e] border-0 hover:brightness-110 active:brightness-95 transition-all"
                style={{
                  ...oauthBtnBase,
                  background: "#00d964",
                  opacity:    loading ? 0.7 : 1,
                }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Masuk..." : "Masuk"}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              <span className="text-white/20 text-[11px]">atau lanjutkan dengan</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* OAuth buttons — same height, side by side */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleGithubLogin}
                className="w-full gap-2 font-medium text-white border-0 hover:brightness-110 active:brightness-95 transition-all"
                style={{
                  ...oauthBtnBase,
                  background: "#24292e",
                  border:     "0.5px solid rgba(255,255,255,0.15)",
                }}
              >
                <Github className="w-4 h-4 flex-shrink-0" />
                GitHub
              </Button>

              <Button
                onClick={handleGitlabLogin}
                className="w-full gap-2 font-medium border-0 hover:brightness-110 active:brightness-95 transition-all"
                style={{
                  ...oauthBtnBase,
                  background: "rgba(252,109,38,0.10)",
                  color:      "#fc6d26",
                  outline:    "0.5px solid rgba(252,109,38,0.28)",
                }}
              >
                <GitLabIcon className="w-4 h-4 flex-shrink-0" />
                GitLab
              </Button>
            </div>

            {/* Register hint — bottom */}
            <p className="text-center text-xs text-white/30 mt-5">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-[#00d964] hover:brightness-110 transition-all font-medium"
              >
                Daftar sekarang
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}