"use client";

import { motion } from "framer-motion";
import { LANDING_STEPS } from "../contants/steps";
import { fadeUp, staggerContainer } from "../contants/LandingAnimations";

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-[5%] bg-black border-t border-white/5">
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
            <p className="text-xs text-white/40 uppercase tracking-[0.3em] font-medium">Cara Kerja</p>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-medium text-white leading-[1.2]">
            Mulai dalam{" "}
            <span
              style={{
                background: "linear-gradient(144.5deg, #00d964 28%, rgba(0,217,100,0.2) 115%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              4 langkah
            </span>
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-0"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {LANDING_STEPS.map(({ num, icon: Icon, title, desc }, i) => (
            <motion.div key={num} variants={fadeUp} className="relative group">
              {i < LANDING_STEPS.length - 1 && (
                <div className="hidden md:block absolute top-5 left-[calc(50%+28px)] right-0 h-px bg-white/10 z-0" />
              )}

              <div className="relative z-10 flex flex-col items-start md:items-center text-left md:text-center px-0 md:px-6 pb-10 md:pb-0">
                <div className="relative mb-6">
                  <div className="w-10 h-10 rounded-full border border-white/15 bg-black flex items-center justify-center group-hover:border-[#00d964]/40 transition-colors duration-300">
                    <Icon className="w-4 h-4 text-white/40 group-hover:text-[#00d964] transition-colors duration-300" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black border border-white/10 flex items-center justify-center text-[10px] font-medium text-white/30">
                    {num}
                  </span>
                </div>

                <h3 className="text-sm font-medium text-white mb-2">{title}</h3>
                <p className="text-xs text-white/35 leading-relaxed font-light">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}