"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ShieldCheck, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex flex-col items-center justify-between overflow-hidden bg-[#FCFAF6] pt-28 sm:pt-36 pb-8 sm:pb-12 px-4 sm:px-6 w-full max-w-full">
      {/* 1. ASOSIY AKVAREL FON RASMI */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/assets/planner.png"
          alt="Thanksgiving Banquet Artwork"
          fill
          priority
          className="object-cover object-top opacity-90"
        />
        {/* Pastdagi krem rangga (#FCFAF6) erituvchi gradient qatlami */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FCFAF6]/40 to-[#FCFAF6]" />
      </div>

      {/* 2. MATNLAR VA INTERFEYS */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center w-full px-2">
        <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-stone-200/90 rounded-full px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold text-stone-800 shadow-sm mb-4 sm:mb-6 max-w-full">
          <ShieldCheck className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-600 shrink-0" />
          <span className="truncate">USDA Safety Guidance · 165°F Safe Target ›</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.04em] text-[#111111] leading-[1.08] drop-shadow-sm max-w-3xl">
          The centerpiece of your table starts days before the oven.
        </h1>

        <p className="text-sm sm:text-base md:text-xl text-stone-800 font-medium max-w-2xl mx-auto mt-4 sm:mt-6 leading-relaxed">
          A scientifically timed schedule to safely thaw your holiday turkey —
          calculated backwards from the moment your roast enters the heat.
        </p>

        <div className="mt-6 sm:mt-8">
          <Link
            href="#calculator"
            className="inline-flex items-center gap-2 bg-[#111111] hover:bg-neutral-800 text-white text-sm sm:text-base font-semibold px-6 sm:px-7 py-3 sm:py-3.5 rounded-full shadow-lg transition duration-200"
          >
            <span>Start Backwards Planning</span>
            <ArrowDown className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 3. HERO PASTKI STATUS QATORI */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-stone-700 pt-8 sm:pt-12 border-t border-stone-300/40">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#EA580C]" />
          <span>Thanksgiving 2026 Ready</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Scroll down to configure weight &amp; time</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </div>
      </div>
    </section>
  );
}

// Ikkala usulda ham import qilish imkoniyati:
export default HeroSection;