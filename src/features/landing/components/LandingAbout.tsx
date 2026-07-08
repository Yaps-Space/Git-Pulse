"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Separator } from "@/shared/components/ui/separator";
import { fadeUp, slideInRight, staggerContainer } from "../contants/LandingAnimations";
import { VALUES } from "../contants/about";

export function LandingAbout() {
  return (
    <section id="about" className="py-32 px-[5%] bg-black border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-white/20" />
              <p className="text-xs text-white/40 uppercase tracking-[0.3em] font-medium">Tentang GitPulse</p>
            </motion.div>

            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-medium text-white leading-[1.2] mb-6">
              Evaluasi tim yang{" "}
              <span
                style={{
                  background: "linear-gradient(144.5deg, #00d964 28%, rgba(0,217,100,0.2) 115%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                adil dan berbasis bukti
              </span>
            </motion.h2>

            <motion.p variants={fadeUp} className="text-sm text-white/45 leading-relaxed mb-6 font-light">
              GitPulse lahir dari kebutuhan nyata dalam project-based learning, evaluator kesulitan memetakan kontribusi karena username GitHub/GitLab tidak selalu sesuai nama asli anggota tim. Lewat Team Space, GitPulse memetakan identitas kontributor secara otomatis dan menganalisis kontribusi tiap anggota dengan tiga model Machine Learning yang objektif dan dapat dipertanggungjawabkan.
            </motion.p>

            <motion.p variants={fadeUp} className="text-sm text-white/45 leading-relaxed mb-10 font-light">
              Platform ini dirancang untuk dua pihak. Owner dan Evaluator yang membutuhkan gambaran menyeluruh tentang tim, dan Contributor yang ingin memantau perkembangan diri sendiri secara transparan.
            </motion.p>

            <motion.div variants={fadeUp} className="flex items-center gap-5">
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="GitPulse" width={36} height={36} className="rounded-md" />
                <div>
                  <span className="text-white text-sm font-bold ">Git<span className="text-sm font-bold text-[#00d964]">Pulse</span></span>
                  <p className="text-xs text-white/35">Platform Evaluasi Team Space</p>
                </div>
              </div>

              <Separator orientation="vertical" className="h-10 bg-white/10" />

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#00d964]">3</p>
                  <p className="text-xs text-white/35 mt-1">Model ML</p>
                </div>
                <Separator orientation="vertical" className="h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#00d964]">3</p>
                  <p className="text-xs text-white/35 mt-1">Role</p>
                </div>
                <Separator orientation="vertical" className="h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#00d964]">∞</p>
                  <p className="text-xs text-white/35 mt-1">Repository</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={slideInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 gap-3"
          >
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group border border-white/8 rounded-2xl p-5 hover:border-[#00d964]/20 hover:bg-white/[0.02] transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:border-[#00d964]/30 group-hover:bg-[#00d964]/5 transition-all duration-300">
                  <Icon className="w-4 h-4 text-white/50 group-hover:text-[#00d964] transition-colors duration-300" />
                </div>
                <p className="text-sm font-medium text-white mb-2">{title}</p>
                <p className="text-xs text-white/35 leading-relaxed font-light">{desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}