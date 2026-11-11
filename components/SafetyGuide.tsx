'use client';

import React, { useState } from 'react';
import {
  Thermometer,
  AlertTriangle,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  Flame,
  Snowflake,
  FileText,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { CheatSheetModal } from './CheatSheetModal';

export function SafetyGuide() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  function handleSyncReminders() {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TurkeyThaw//Safety Reminders//EN',
      'BEGIN:VEVENT',
      `UID:usda-temp-check-${Date.now()}@turkeythaw.pages.dev`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`,
      `DTSTART:${new Date(Date.now() + 3600000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`,
      `SUMMARY:Turkey Temperature Verification Reminder (165°F)`,
      `DESCRIPTION:Verify thickest part of turkey thigh, wing, and innermost breast with digital instant-read probe reaches minimum 165°F (74°C). Backed by USDA FSIS.`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'turkey-safety-reminder.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <section id="usda-guide" className="pt-16 sm:pt-24 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 w-full max-w-6xl mx-auto scroll-mt-24 sm:scroll-mt-28">
      {/* Header */}
      <div className="text-left">
        <div className="text-xs font-bold uppercase tracking-widest text-[#EA580C] font-mono flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>USDA COMPLIANCE &amp; PROTOCOLS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] mt-2 text-[#111111]">
          The line between perfection and danger is exactly 165°F.
        </h2>
        <p className="text-stone-600 mt-2 text-sm sm:text-base md:text-lg max-w-2xl font-normal">
          Essential temperature thresholds, pathogen kill-curves, and emergency contingency protocols for holiday cooks.
        </p>
      </div>

      {/* Responsive Grid: Single Column Mobile, 12-Col Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-full mt-10 sm:mt-12 items-start">
        {/* LEFT CARD: Turkey Temperature Guide & Scale (7 cols on Desktop) */}
        <div className="lg:col-span-7 w-full max-w-full bg-white rounded-3xl p-5 sm:p-7 md:p-8 border border-stone-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100/80 text-[#EA580C] flex items-center justify-center shrink-0">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111111] tracking-tight">Turkey Temperature Guide</h3>
                <p className="text-xs text-stone-500 font-mono">USDA FSIS Empirical Microbial Inactivation</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-mono font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>165°F TARGET</span>
            </span>
          </div>

          {/* Pure CSS Interactive Thermometer Scale */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-4">
            {/* 4 clear markers */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono font-bold">
              <div className="text-left">
                <span className="text-blue-600 block text-xs sm:text-sm">32°F</span>
                <span className="text-[10px] text-stone-400 font-semibold uppercase">FREEZE</span>
              </div>
              <div className="text-center">
                <span className="text-teal-700 block text-xs sm:text-sm">40°F</span>
                <span className="text-[10px] text-stone-400 font-semibold uppercase">MAX FRIDGE</span>
              </div>
              <div className="text-center">
                <span className="text-rose-600 block text-xs sm:text-sm">40°F–140°F</span>
                <span className="text-[10px] text-rose-500 font-bold uppercase">DANGER ZONE</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-700 block text-xs sm:text-sm">165°F</span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase">✓ SAFE TARGET</span>
              </div>
            </div>

            {/* Gradient Track Bar */}
            <div className="relative">
              <div className="h-5 w-full rounded-full bg-gradient-to-r from-blue-400 via-amber-400 via-55% via-rose-500 to-emerald-500 relative overflow-hidden shadow-inner" />
              {/* Highlight Pin at 165°F */}
              <div className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-emerald-600 shadow flex items-center justify-center" />
            </div>

            <div className="flex items-start gap-2 text-xs text-stone-600 font-medium pt-1">
              <AlertTriangle className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
              <span>
                <strong>Bacteria multiplies rapidly</strong> between 40°F and 140°F. Never leave raw poultry at room temperature for more than 2 hours.
              </span>
            </div>
          </div>

          {/* 3-Column Anatomical Verification Grid (Pure Vector UI — NO mutated turkey art!) */}
          <div>
            <div className="text-xs font-bold text-[#111111] uppercase tracking-wider font-mono mb-3">
              3 Required Anatomical Verification Points
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Point 1 */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                <div className="text-[11px] font-mono font-bold text-[#EA580C]">01 · THIGH</div>
                <div className="text-sm font-bold text-stone-900">Innermost Thigh (165°F)</div>
                <p className="text-xs text-stone-600 leading-snug pt-1">
                  Insert probe into the deepest muscle, strictly avoiding bone contact.
                </p>
              </div>

              {/* Point 2 */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                <div className="text-[11px] font-mono font-bold text-[#EA580C]">02 · BREAST</div>
                <div className="text-sm font-bold text-stone-900">Thickest Breast (165°F)</div>
                <p className="text-xs text-stone-600 leading-snug pt-1">
                  Insert horizontally from the side into the deepest white meat core.
                </p>
              </div>

              {/* Point 3 */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                <div className="text-[11px] font-mono font-bold text-[#EA580C]">03 · WING JOINT</div>
                <div className="text-sm font-bold text-stone-900">Wing Joint (165°F)</div>
                <p className="text-xs text-stone-600 leading-snug pt-1">
                  Check innermost joint connection to verify juices run completely clear.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: Emergency Protocols (5 cols on Desktop) */}
        <div className="lg:col-span-5 w-full max-w-full bg-white rounded-3xl p-5 sm:p-7 md:p-8 border border-stone-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100/80 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111111] tracking-tight">Emergency Protocols</h3>
                <p className="text-xs text-stone-500 font-mono">Action Plans for Holiday Disasters</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200/60 text-[10px] font-mono font-bold">
              USDA CONTINGENCY
            </span>
          </div>

          {/* 3 Interactive Accordions */}
          <div className="space-y-3">
            {/* Accordion 1 */}
            <div className="border border-stone-200/80 rounded-2xl overflow-hidden transition-all shadow-2xs">
              <button
                type="button"
                onClick={() => toggleAccordion(0)}
                className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    <Snowflake className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#111111]">
                      Thanksgiving Morning Panic: Still Frozen?
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">Submerge immediately in cold tap water</div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-stone-400 shrink-0 mt-1 transition-transform ${
                    openAccordion === 0 ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openAccordion === 0 && (
                <div className="px-4 pb-4 pt-1 text-xs text-stone-600 leading-relaxed border-t border-stone-100 bg-stone-50/50">
                  <p>
                    <strong>Do not panic.</strong> Submerge the bird in a leak-proof bag in cold tap water. Change the water every <strong>30 minutes</strong> to ensure continuous rapid heat transfer while keeping the exterior safely under 40°F. Defrosts at ~<strong>30 minutes per pound</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 2 */}
            <div className="border border-stone-200/80 rounded-2xl overflow-hidden transition-all shadow-2xs">
              <button
                type="button"
                onClick={() => toggleAccordion(1)}
                className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#111111]">
                      Can You Roast a Fully Frozen Turkey?
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">USDA-approved safe emergency method</div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-stone-400 shrink-0 mt-1 transition-transform ${
                    openAccordion === 1 ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openAccordion === 1 && (
                <div className="px-4 pb-4 pt-1 text-xs text-stone-600 leading-relaxed border-t border-stone-100 bg-stone-50/50">
                  <p>
                    <strong>Yes, it is completely safe.</strong> The USDA confirms you can roast a frozen bird at 325°F. Total cooking time will increase by approximately <strong>50%</strong> (e.g., a 14 lb bird takes ~4.5–5 hrs). Remove giblet pack with tongs after 2 hours once loosened.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 3 */}
            <div className="border border-stone-200/80 rounded-2xl overflow-hidden transition-all shadow-2xs">
              <button
                type="button"
                onClick={() => toggleAccordion(2)}
                className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#111111]">Safe Fridge Holding Window</div>
                    <div className="text-xs text-stone-500 mt-0.5">Buffer time after full thaw</div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-stone-400 shrink-0 mt-1 transition-transform ${
                    openAccordion === 2 ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openAccordion === 2 && (
                <div className="px-4 pb-4 pt-1 text-xs text-stone-600 leading-relaxed border-t border-stone-100 bg-stone-50/50">
                  <p>
                    A fully refrigerator-thawed turkey can remain safely held in the refrigerator for <strong>1 to 2 days</strong> before cooking. Keep on a rimmed tray on the lowest shelf to prevent any drips.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center gap-2.5 text-xs text-stone-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All protocols formulated directly according to USDA FSIS Guidelines.</span>
          </div>
        </div>
      </div>

      {/* Bottom Utility Bar */}
      <div className="mt-8 bg-white rounded-2xl p-5 border border-stone-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100/80 text-[#EA580C] flex items-center justify-center font-bold text-sm shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#111111]">Keep the guide close at hand</div>
            <div className="text-xs text-stone-500">Printable kitchen cheat-sheet and countdown reminders.</div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setCheatSheetOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#111111] hover:bg-neutral-800 text-white rounded-full px-5 py-2.5 text-xs font-semibold tracking-tight transition shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-stone-300" />
            <span>Download Kitchen Cheat-Sheet PDF ↓</span>
          </button>

          <button
            type="button"
            onClick={handleSyncReminders}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-full px-4 py-2.5 text-xs font-semibold tracking-tight transition shadow-sm"
          >
            <Bell className="w-3.5 h-3.5 text-stone-600" />
            <span>Sync Reminders</span>
          </button>
        </div>
      </div>

      {/* Self-contained CheatSheetModal */}
      <CheatSheetModal
        isOpen={cheatSheetOpen}
        onClose={() => setCheatSheetOpen(false)}
      />
    </section>
  );
}
