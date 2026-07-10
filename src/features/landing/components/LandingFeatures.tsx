"use client";

import { motion } from "framer-motion";
import { Badge } from "@/shared/components/ui/badge";
import { LANDING_FEATURES } from "../contants/features";
import { fadeUp, staggerContainer } from "../contants/LandingAnimations";

export function LandingFeatures() {
  const primary   = LANDING_FEATURES.filter(f => f.primary)
  const secondary = LANDING_FEATURES.filter(f => !f.primary)

  return (
    <section id="features" className="py-32 px-[5%] bg-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-20"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-white/20" />
            <p className="text-xs text-white/40 uppercase tracking-[0.3em] font-medium">Fitur Utama</p>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-medium text-white leading-[1.2] max-w-xl">
            Evaluasi tim yang{" "}
            <span
              style={{
                background:           "linear-gradient(144.5deg, #00d964 28%, rgba(0,217,100,0.2) 115%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:  "transparent",
                backgroundClip:       "text",
              }}
            >
              berbasis data nyata
            </span>
          </motion.h2>
        </motion.div>

        {/* Primary features — Team Space & ML Scoring */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/5 mb-px"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {primary.map(({ icon: Icon, title, desc, tags }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="group bg-black p-8 md:p-10 hover:bg-white/[0.03] transition-colors duration-500 relative overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 0%, rgba(0,217,100,0.06) 0%, transparent 60%)" }}
              />
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:border-[#00d964]/30 group-hover:bg-[#00d964]/5 transition-all duration-300">
                <Icon className="w-5 h-5 text-white/60 group-hover:text-[#00d964] transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-medium text-white mb-3">{title}</h3>
              <p className="text-sm text-white/40 leading-relaxed mb-6 font-light">{desc}</p>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-[#00d964]/50 border-[#00d964]/20 bg-transparent rounded-full text-xs font-normal"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Secondary features — 2 kolom lebih compact */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/5 border-t-0 rounded-t-none"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {secondary.map(({ icon: Icon, title, desc, tags }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="group bg-black p-8 hover:bg-white/[0.02] transition-colors duration-500 relative overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 100%, rgba(0,217,100,0.04) 0%, transparent 70%)" }}
              />
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:border-[#00d964]/30 group-hover:bg-[#00d964]/5 transition-all duration-300">
                <Icon className="w-4 h-4 text-white/50 group-hover:text-[#00d964] transition-colors duration-300" />
              </div>
              <h3 className="text-base font-medium text-white mb-2">{title}</h3>
              <p className="text-sm text-white/35 leading-relaxed mb-5 font-light">{desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-white/25 border-white/10 bg-transparent rounded-full text-xs font-normal"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}