"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4";

export function RegisterLayout() {
  const router = useRouter();

  const [fullName, setFullName]           = useState("");
  const [email, setEmail]                 = useState("");
  const [username, setUsername]           = useState("");
  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirmPass] = useState("");
  const [showPass, setShowPass]           = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ fullName, email, username, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Terjadi kesalahan.");
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Tidak bisa menghubungi server. Coba lagi.");
    } finally {
      setLoading(false);
    }
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

  const focusStyle = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.currentTarget.style.borderColor = "rgba(0,217,100,0.45)");
  const blurStyle = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)");

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

      {/* Back button — top left, consistent with login */}
      <Link
        href="/login"
        className="absolute top-5 left-5 z-20 flex items-center gap-1.5 text-white/45 hover:text-white/80 text-sm font-medium transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Card — same width as login */}
      <div className="relative z-10 w-full max-w-[460px] px-4 py-10">
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
          <CardHeader className="flex flex-col items-center text-center pb-2 px-0">
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
              Buat Akun Baru
            </h2>
            <p className="text-white/35 text-xs mt-2 max-w-[280px] leading-relaxed">
              Daftar gratis dan mulai pantau aktivitas Git tim kamu hari ini.
            </p>
          </CardHeader>

          <CardContent className="px-0 pb-0">
            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              {/* Full Name */}
              <div>
                <label className="text-white/45 text-[11.5px] font-medium mb-1.5 block">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  style={inputStyle}
                  className="autofill-dark"
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-white/45 text-[11.5px] font-medium mb-1.5 block">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  style={inputStyle}
                  className="autofill-dark"
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>

              {/* Username */}
              <div>
                <label className="text-white/45 text-[11.5px] font-medium mb-1.5 block">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                  placeholder="username_kamu"
                  required
                  style={inputStyle}
                  className="autofill-dark"
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>

              {/* Password + Confirm — 2 kolom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/45 text-[11.5px] font-medium mb-1.5 block">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 karakter"
                      required
                      minLength={8}
                      style={{ ...inputStyle, paddingRight: "36px" }}
                      className="autofill-dark"
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{
                        position:   "absolute",
                        right:      "10px",
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
                      {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-white/45 text-[11.5px] font-medium mb-1.5 block">
                    Konfirmasi
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Ulangi"
                      required
                      style={{ ...inputStyle, paddingRight: "36px" }}
                      className="autofill-dark"
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{
                        position:   "absolute",
                        right:      "10px",
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
                      {showConfirm
                        ? <EyeOff className="w-3.5 h-3.5" />
                        : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
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
                className="w-full gap-2 text-sm font-semibold text-[#0a1a0e] border-0 hover:brightness-110 active:brightness-95 transition-all mt-2"
                style={{
                  height:       "42px",
                  background:   "#00d964",
                  borderRadius: "10px",
                  opacity:      loading ? 0.7 : 1,
                }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Membuat akun..." : "Buat Akun"}
              </Button>

              {/* Login hint — bottom */}
              <p className="text-center text-xs text-white/30 mt-1">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="text-[#00d964] hover:brightness-110 transition-all font-medium"
                >
                  Masuk sekarang
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}