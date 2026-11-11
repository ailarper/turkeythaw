"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Lenis from "lenis";
import { CheatSheetModal } from "@/components/CheatSheetModal";
import { HeroSection } from "@/components/HeroSection";
import { ThawCalculator } from "@/components/ThawCalculator";
import { SafetyGuide } from "@/components/SafetyGuide";
import { BattleBoard } from "@/components/BattleBoard";
import { Footer } from "@/components/Footer";
import { ThawMethod } from "@/lib/schedule";

function ClocheLogoIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="18" cy="4.5" r="2.5" fill="#EA580C" stroke="#1B1A18" strokeWidth="2" />
      <path
        d="M5 20C5 12.268 10.8203 6 18 6C25.1797 6 31 12.268 31 20H5Z"
        fill="#EA580C"
        stroke="#1B1A18"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9.5 17C10.5 12.5 13.8 9.5 17.5 9" stroke="#FDBA74" strokeWidth="2" strokeLinecap="round" />
      <rect x="3" y="20" width="30" height="3.5" rx="1.75" fill="#FB923C" stroke="#1B1A18" strokeWidth="2" />
    </svg>
  );
}

export default function TurkeyThawPage() {
  const [activeSection, setActiveSection] = useState<string>("planner");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedWeight, setSelectedWeight] = useState<number>(16);
  const [selectedMethod, setSelectedMethod] = useState<ThawMethod>("refrigerator");
  const [dinnerTime] = useState<string>("16:00");

  // Initialize Lenis Smooth Scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Smooth scroll handler
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // IntersectionObserver to track currently visible section
  useEffect(() => {
    const sectionIds = ["planner", "dashboard", "guide", "timeline"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -40% 0px",
        threshold: 0.15,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main
      id="top"
      className="min-h-screen w-full bg-[#FAF9F5] text-[#111111] flex flex-col select-none antialiased relative overflow-x-hidden font-sans"
    >
      {/* ============================================================== */}
      {/* ALWAYS-ON UNIFIED FLOATING GLASS NAVBAR (Fixed Top - 100% Vis) */}
      {/* ============================================================== */}
      <header className="fixed top-5 inset-x-0 mx-auto max-w-5xl z-50 px-4 sm:px-6 pointer-events-auto">
        <div className="backdrop-blur-md bg-[#FAF9F5]/90 border border-[#E6E4DD] rounded-full px-5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-sm">
          {/* Left: Brand Logo with Illustrated Orange Cloche Platter Icon */}
          <motion.button
            type="button"
            onClick={() => scrollTo("planner")}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2.5 focus:outline-none group cursor-pointer"
            aria-label="TurkeyThaw Home"
          >
            <div className="w-8 h-8 rounded-full bg-[#FFF0E5] flex items-center justify-center p-1 shadow-xs group-hover:scale-105 transition-transform">
              <ClocheLogoIcon className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-[17px] tracking-tight text-[#111111]">
              Turkey<span className="text-[#EA580C]">Thaw</span>
            </span>
          </motion.button>

          {/* Center: Smooth-scroll links with animated layoutId indicator */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 text-[13px] font-medium">
            {[
              { id: "dashboard", label: "Calculator" },
              { id: "dashboard", label: "Prep Kit" },
              { id: "guide", label: "USDA Guide" },
              { id: "timeline", label: "Timeline" },
            ].map((link, idx) => {
              const isActive =
                activeSection === link.id && (link.label !== "Prep Kit" || activeSection === "dashboard");
              return (
                <motion.button
                  key={`${link.label}-${idx}`}
                  type="button"
                  onClick={() => scrollTo(link.id)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`relative px-3.5 py-1.5 rounded-full transition-colors duration-150 cursor-pointer ${
                    isActive ? "text-[#111111] font-semibold" : "text-neutral-600 hover:text-[#111111]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-neutral-200/70 rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {link.label}
                </motion.button>
              );
            })}
          </nav>

          {/* Right: Dark pill CTA button with tactile feedback */}
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              onClick={() => scrollTo("dashboard")}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 bg-[#111111] hover:bg-[#262626] text-white text-[13px] font-semibold px-4 sm:px-5 py-2 rounded-full transition-all duration-150 shadow-sm hover:shadow-md cursor-pointer"
            >
              <span>Plan dinner</span>
              <span className="text-[#EA580C] font-bold">→</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 1. SECTION 1: HERO PLANNER                                     */}
      {/* ============================================================== */}
      <section id="planner" className="w-full max-w-full">
        <HeroSection />
      </section>

      {/* ============================================================== */}
      {/* 2. SECTION 2: CALCULATOR & PREP KIT                            */}
      {/* ============================================================== */}
      <section id="dashboard" className="w-full max-w-full">
        <ThawCalculator
          weight={selectedWeight}
          onWeightChange={setSelectedWeight}
          method={selectedMethod === "refrigerator" ? "fridge" : "water"}
          onMethodChange={(m) => setSelectedMethod(m === "fridge" ? "refrigerator" : "cold-water")}
        />
      </section>

      {/* ============================================================== */}
      {/* 3. SECTION 3: USDA COMPLIANCE & SAFETY GUIDE                   */}
      {/* ============================================================== */}
      <section id="guide" className="w-full max-w-full">
        <SafetyGuide />
      </section>

      {/* ============================================================== */}
      {/* 4. SECTION 4: COOK-DAY BATTLE BOARD & TIMELINE                 */}
      {/* ============================================================== */}
      <section id="timeline" className="w-full max-w-full">
        <BattleBoard weight={selectedWeight} />
      </section>

      {/* ============================================================== */}
      {/* 5. SITE FOOTER                                                 */}
      {/* ============================================================== */}
      <Footer />

      {/* ============================================================== */}
      {/* KITCHEN CHEAT-SHEET MODAL (PRINT / PDF)                         */}
      {/* ============================================================== */}
      <CheatSheetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedWeight={selectedWeight}
        selectedMethod={selectedMethod}
        dinnerTime={dinnerTime}
      />
    </main>
  );
}
