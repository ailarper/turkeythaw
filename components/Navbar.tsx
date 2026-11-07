'use client';

import React, { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-5 inset-x-0 mx-auto max-w-5xl z-50 px-6 w-full pointer-events-none">
      <nav
        className="pointer-events-auto bg-white/90 backdrop-blur-md border border-stone-200/80 rounded-full px-6 py-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex items-center justify-between transition-all"
        aria-label="Main Navigation"
      >
        {/* Left: Orange SVG cloche icon + bold TurkeyThaw */}
        <a href="#top" className="inline-flex items-center gap-2.5 select-none no-underline group" aria-label="TurkeyThaw Home">
          <div className="relative w-6 h-6 shrink-0 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 shrink-0 text-[#EA580C]"
            >
              {/* 4-point star on cloche handle */}
              <path
                d="M12 2L12.5 4.3C12.7 5.1 13.4 5.8 14.2 6L16.5 6.5L14.2 7C13.4 7.2 12.7 7.9 12.5 8.7L12 11L11.5 8.7C11.3 7.9 10.6 7.2 9.8 7L7.5 6.5L9.8 6C10.6 5.8 11.3 5.1 11.5 4.3L12 2Z"
                fill="#EA580C"
              />
              {/* Cloche dome */}
              <path
                d="M5 16.5C5 11.8 8.1 8 12 8C15.9 8 19 11.8 19 16.5H5Z"
                fill="#EA580C"
              />
              {/* Serving tray plate */}
              <rect x="3" y="17.5" width="18" height="2" rx="1" fill="#EA580C" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-[#111111] leading-none">
            Turkey<span className="text-[#EA580C]">Thaw</span>
          </span>
        </a>

        {/* Center links (Desktop) */}
        <div className="hidden md:flex items-center gap-7">
          <a
            href="#calculator"
            className="text-[13px] font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            Calculator
          </a>
          <a
            href="#prep-kit"
            className="text-[13px] font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            Prep Kit
          </a>
          <a
            href="#usda-guide"
            className="text-[13px] font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            USDA Guide
          </a>
          <a
            href="#battle-board"
            className="text-[13px] font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            Battle Board
          </a>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <a
            href="#calculator"
            className="inline-flex items-center gap-1.5 bg-[#111111] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-neutral-800 active:scale-[0.98] transition shadow-sm"
          >
            <span>Plan dinner</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-300" />
          </a>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="md:hidden p-1.5 text-stone-600 hover:text-stone-900 rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto md:hidden mt-2 p-4 bg-white/95 backdrop-blur-xl rounded-2xl border border-stone-200/90 shadow-xl flex flex-col gap-2.5 text-sm font-medium text-stone-700 animate-in fade-in slide-in-from-top-2 duration-150">
          <a
            href="#calculator"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            Calculator
          </a>
          <a
            href="#prep-kit"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            Prep Kit
          </a>
          <a
            href="#usda-guide"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            USDA Guide
          </a>
          <a
            href="#battle-board"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            Battle Board
          </a>
        </div>
      )}
    </header>
  );
}
