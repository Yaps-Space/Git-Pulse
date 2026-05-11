"use client";

import { motion } from "framer-motion";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { LANDING_ROLES, LANDING_TEAM_PREVIEW } from "../contants/roles";
import { fadeUp, slideInLeft, slideInRight, staggerContainer } from "../contants/LandingAnimations";

export function LandingRoles() {
  const avgContrib =
    LANDING_TEAM_PREVIEW.reduce((sum, m) => sum + parseFloat(m.kontribusi), 0) /
    LANDING_TEAM_PREVIEW.length;

  return (
    <section id="roles" className="py-32 px-[5%] bg-black border-t border-white/5">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-start">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-white/20" />
            <p className="text-xs text-white/40 uppercase tracking-[0.3em] font-medium">Sistem Role</p>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-medium text-white leading-[1.2] mb-5">
            Tiga peran,{" "}
            <span
              style={{
                background: "linear-gradient(144.5deg, #00d964 28%, rgba(0,217,100,0.2) 115%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              satu ekosistem
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm text-white/40 leading-relaxed mb-10 font-light max-w-sm">
            Role ditentukan otomatis dari aksi yang kamu lakukan — buat tim atau bergabung.
          </motion.p>

          <motion.div variants={staggerContainer} className="space-y-3">
            {LANDING_ROLES.map(({ icon: Icon, name, badge, perms }) => (
              <motion.div
                key={name}
                variants={slideInLeft}
                className="group border border-white/8 rounded-2xl p-5 hover:border-[#00d964]/20 hover:bg-white/[0.02] transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#00d964]/30 group-hover:bg-[#00d964]/5 transition-all duration-300">
                    <Icon className="w-4 h-4 text-white/50 group-hover:text-[#00d964] transition-colors duration-300" />
                  </div>
                  <span className="font-medium text-white text-sm">{name}</span>
                  <Badge
                    variant="outline"
                    className="ml-auto text-[10px] text-[#00d964]/50 border-[#00d964]/20 bg-transparent rounded-full font-normal"
                  >
                    {badge}
                  </Badge>
                </div>
                <Separator className="bg-white/5 mb-4" />
                <div className="space-y-2">
                  {perms.map((p) => (
                    <div key={p} className="flex items-center gap-2.5 text-xs text-white/35">
                      <div className="w-1 h-1 rounded-full bg-[#00d964]" />
                      {p}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          variants={slideInRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="border border-white/8 rounded-3xl p-6 bg-white/[0.02]"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00d964]" />
              <p className="text-xs font-medium text-white/50">Team: Proyek Tugas Akhir</p>
            </div>
            <span className="text-[10px] text-white/25 font-mono">Kode: 12KAJJA</span>
          </div>
          <p className="text-[11px] text-white/25 mb-5 pl-4">Tim dibentuk untuk mengerjakan projek.</p>

          <div className="space-y-2 mb-6">
            {LANDING_TEAM_PREVIEW.map(({ initials, name, role, kontribusi, bg }) => (
              <div
                key={name}
                className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-3 py-2.5 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className={`${bg} w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{name}</p>
                  <p className="text-[10px] text-white/30">{role}</p>
                </div>
                <span className="text-sm font-bold text-[#00d964]">{kontribusi}</span>
              </div>
            ))}
          </div>

          <Separator className="bg-white/5 mb-6" />

          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
            <p className="text-xs text-white/35 mb-2">Rata-rata Kontribusi Tim</p>
            <p className="text-3xl font-bold text-[#00d964] mb-3">{avgContrib.toFixed(1)}%</p>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#00d964]"
                style={{ width: `${Math.min(avgContrib, 100)}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}