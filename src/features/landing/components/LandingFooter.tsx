"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeIn } from "../contants/LandingAnimations";
import { Separator } from "@/shared/components/ui/separator";
import { NAV_COLUMNS } from "../contants/nav";

export function LandingFooter() {
  return (
    <motion.footer
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="bg-white/10 border-t border-white/5 px-[5%] pt-16 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 mb-12">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2 font-bold text-base text-white mb-4">
              <Image src="/logo.png" alt="GitPulse" width={28} height={28} className="rounded-md" />
              <span className="text-white">Git<span className="text-[#00d964]">Pulse</span></span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed font-light">
              Evaluasi kontribusi tim di GitHub & GitLab secara otomatis dan objektif lewat Team Space yang didukung oleh Machine Learning.
            </p>
            <p className="text-white/20 text-xs mt-4">GitPulse, 2026.</p>
          </div>

          <div className="grid grid-cols-3 gap-10">
            {NAV_COLUMNS.map(({ title, links }) => (
              <div key={title}>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-[0.15em] mb-4">{title}</p>
                <div className="flex flex-col gap-3">
                  {links.map(({ label, href }) => (
                    <a
                      key={label}
                      href={href}
                      className="text-white/30 hover:text-white/60 text-sm transition-colors"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-white/5 mb-6" />

        <p className="text-white/20 text-xs text-center">
          © 2026 GitPulse. Analyze smarter. Collaborate better. Ship faster.
        </p>
      </div>
    </motion.footer>
  );
}