"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { fadeUp, staggerContainer } from "../contants/LandingAnimations";
import { GitHubIcon, GitLabIcon } from "@/shared/components/commons/ProviderIcons";

function Marquee() {
  const text = "TEAM SPACE • ML SCORING • ANALISIS REPOSITORY • HEALTH SCORE • QR CODE INVITE • GITHUB • GITLAB • EMAIL LOGIN • ";
  return (
    <div className="bg-white/10 overflow-hidden border-t border-b border-white/5 py-5 mb-24">
      <motion.div
        className="whitespace-nowrap text-xs font-medium tracking-[0.2em] text-white/15 uppercase"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      >
        {text.repeat(6)}
      </motion.div>
    </div>
  );
}

export function LandingCTA() {
  return (
    <section className="pt-32 pb-0 bg-black border-t border-white/5 overflow-hidden">
      <Marquee />
      <div className="px-[5%] pb-32">
        <motion.div
          className="max-w-6xl mx-auto text-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-8">
            <div className="w-8 h-px bg-white/20" />
            <p className="text-xs text-white/40 uppercase tracking-[0.3em] font-medium">Mulai Sekarang</p>
            <div className="w-8 h-px bg-white/20" />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="font-medium leading-[1.15] mb-6 mx-auto"
            style={{
              fontSize:             "clamp(40px, 6vw, 72px)",
              maxWidth:             "700px",
              background:           "linear-gradient(144.5deg, #ffffff 28%, rgba(255,255,255,0.25) 115%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor:  "transparent",
              backgroundClip:       "text",
            }}
          >
            Pantau tim kamu mulai hari ini
          </motion.h2>

          <motion.p variants={fadeUp} className="text-sm text-white/35 mb-10 max-w-md mx-auto leading-relaxed font-light">
            Gratis. Login dengan GitHub, GitLab, atau daftar menggunakan email dan mulai evaluasi kontribusi tim dalam hitungan menit.
          </motion.p>

          <motion.div variants={fadeUp} className="flex gap-3 justify-center flex-wrap mb-8">
            <Button
              asChild
              className="relative overflow-hidden rounded-full gap-2 px-8 py-6 text-sm font-medium text-gray-900 border border-white/30 hover:opacity-90"
              style={{ background: "#00d964", boxShadow: "0 0 20px rgba(0,217,100,0.3)" }}
            >
              <Link href="/login">
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px rounded-full blur-sm"
                  style={{ background: "linear-gradient(90deg, transparent, #00d96480, transparent)" }}
                />
                Mulai Sekarang
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="rounded-full gap-2 px-8 py-6 text-sm font-medium text-white/70 hover:text-white bg-transparent border-white/15 hover:border-white/30 hover:bg-transparent"
            >
              <a href="#features">Pelajari Fitur</a>
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3">
            <p className="text-xs text-white/25">Login dengan</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/30">
                <GitHubIcon className="w-3 h-3" />
                GitHub
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/30">
                <GitLabIcon className="w-3 h-3 text-[#fc6d26]/40" />
                GitLab
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/30">
                <Mail className="w-3 h-3" />
                Email / Username
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}