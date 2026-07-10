"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "../contants/LandingAnimations";
import { LANDING_TECHS } from "../contants/techs";

export function LandingTechStack() {
  return (
    <section id="tech" className="py-32 px-[5%] bg-black border-t border-white/5">
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
            <p className="text-xs text-white/40 uppercase tracking-[0.3em] font-medium">Tech Stack</p>
          </motion.div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-medium text-white leading-[1.2]">
              Dibangun dengan{" "}
              <span
                style={{
                  background: "linear-gradient(144.5deg, #00d964 28%, rgba(0,217,100,0.2) 115%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                teknologi modern
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm text-white/35 max-w-xs font-light leading-relaxed">
              Kombinasi framework terkini dan layanan cloud untuk performa terbaik.
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {LANDING_TECHS.map(({ icon: Icon, name, desc }) => (
            <motion.div
              key={name}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group bg-black p-8 hover:bg-white/[0.03] transition-colors duration-300 relative overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 100%, rgba(0,217,100,0.06) 0%, transparent 70%)" }}
              />
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:border-[#00d964]/30 group-hover:bg-[#00d964]/5 transition-all duration-300">
                <Icon className="w-4 h-4 text-white/50 group-hover:text-[#00d964] transition-colors duration-300" />
              </div>
              <p className="font-medium text-white text-sm mb-2">{name}</p>
              <p className="text-xs text-white/35 leading-relaxed font-light">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}