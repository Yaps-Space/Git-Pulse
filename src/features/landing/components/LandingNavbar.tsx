"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { NAV_LINKS } from "../contants/nav";

export function LandingNavbar() {
  const [open,       setOpen]       = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [activeHref, setActiveHref] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onHashChange = () => setActiveHref(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[5%] h-16 transition-all duration-500",
        scrolled
          ? "bg-black/80 backdrop-blur-md border-b border-white/8 shadow-lg shadow-black/20"
          : "bg-transparent border-b border-transparent"
      )}>
        <Link href="/" className="flex items-center gap-2 font-bold text-base text-white">
          <Image src="/logo.png" alt="GitPulse" width={32} height={32} className="rounded-md" />
          <span className="text-white">Git<span className="text-[#00d964]">Pulse</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setActiveHref(href)}
              className={cn(
                "text-sm font-medium transition-colors",
                activeHref === href ? "text-white" : "text-white/50 hover:text-white"
              )}
            >
              {label}
            </a>
          ))}
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="hidden md:inline-flex rounded-full gap-2 bg-black text-white border-white/20 hover:bg-white/5 hover:text-white hover:border-white/40"
        >
          <Link href="/login">Masuk / Daftar</Link>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white/60 hover:text-white hover:bg-white/5"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed top-16 left-4 right-4 z-50 md:hidden bg-black/95 border border-white/10 rounded-2xl px-4 py-4"
            >
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() => { setActiveHref(href); setOpen(false); }}
                    className={cn(
                      "py-2.5 px-3 rounded-xl text-sm font-medium transition-colors",
                      activeHref === href
                        ? "text-white bg-white/5"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {label}
                  </a>
                ))}
                <div className="mt-2 pt-2 border-t border-white/10">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-xl gap-2 bg-black text-white border-white/20 hover:bg-white/5 hover:text-white"
                  >
                    <Link href="/login" onClick={() => setOpen(false)}>
                      Masuk / Daftar
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}