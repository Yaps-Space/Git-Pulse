"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { fadeUp, fadeIn, staggerContainer } from "../contants/LandingAnimations";

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4";

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        vx:    (Math.random() - 0.5) * 0.3,
        vy:    (Math.random() - 0.5) * 0.3,
        r:     Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.05,
      });
    }

    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 217, 100, ${p.alpha})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 217, 100, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth   = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />;
}

export function LandingHero() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-black">
      <video src={VIDEO_URL} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/50 z-[1]" />
      <ParticleCanvas />

      <motion.div
        className="relative z-20 flex flex-col items-center text-center px-[5%] pt-[160px] md:pt-[180px] pb-[102px]"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={fadeIn}
          className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 mb-10"
          style={{
            background:   "rgba(255,255,255,0.08)",
            border:       "1px solid rgba(255,255,255,0.15)",
            borderRadius: "20px",
          }}
        >
          <Image src="/logo.png" alt="GitPulse" width={20} height={20} className="rounded-sm" />
          <span className="text-white/60 text-[13px] font-medium">Powered by</span>
          <span className="text-white text-[13px] font-medium">Machine Learning</span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="font-medium leading-[1.28] mb-6 max-w-[613px]"
          style={{
            fontSize:             "clamp(36px, 5vw, 56px)",
            background:           "linear-gradient(144.5deg, #ffffff 28%, rgba(0,0,0,0) 115%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
            backgroundClip:       "text",
          }}
        >
          Evaluasi Kontribusi Tim Developer Secara Objektif
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-[15px] font-normal max-w-[680px] mb-10"
          style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}
        >
          GitPulse membantu evaluator dan developer memantau kontribusi tim secara transparan. Berbasis data GitHub & GitLab, dianalisis otomatis dengan Machine Learning.
        </motion.p>

        <motion.div variants={fadeUp} className="flex gap-3 flex-wrap justify-center mb-6">
          <Button
            asChild
            className="relative overflow-hidden rounded-full gap-2 px-7 py-6 text-sm font-medium text-gray-900 border border-white/30 hover:opacity-90"
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
            className="rounded-full gap-2 px-7 py-6 text-sm font-medium text-white bg-transparent border-white/30 hover:bg-white/5 hover:text-white hover:border-white/50"
          >
            <a href="#how-it-works">Lihat Cara Kerja</a>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}