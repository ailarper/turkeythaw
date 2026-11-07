'use client';

import React, { useState, useMemo } from 'react';
import {
  Clock,
  Sparkles,
  ExternalLink,
  ChevronDown,
  HelpCircle,
  Wind,
  Flame,
  Activity,
  ShieldCheck,
  Utensils,
  ArrowUp,
} from 'lucide-react';

interface BattleBoardProps {
  weight?: number;
}

const DINNER_TIMES = [
  { label: '02:00 PM', hour: 14, minute: 0 },
  { label: '03:00 PM', hour: 15, minute: 0 },
  { label: '04:00 PM', hour: 16, minute: 0 },
  { label: '05:00 PM', hour: 17, minute: 0 },
  { label: '06:00 PM', hour: 18, minute: 0 },
];

const FAQS = [
  {
    q: 'How long can a thawed bird stay in the fridge?',
    a: '1–2 days max. Once fully defrosted, keep the turkey in its original packaging or a leakproof tray on the lowest shelf of your refrigerator at 40°F (4°C) or below.',
  },
  {
    q: "Can I brine while it's still thawing?",
    a: 'Only during the final 12 hours. A frozen bird cannot absorb salt solutions through ice crystals. Wait until the breast and thighs are pliable before submerging in wet brine.',
  },
  {
    q: 'Why rest for 40 minutes?',
    a: 'Allows internal juices to redistribute. During oven roasting, muscle fibers contract and push moisture toward the center. A 35–40 minute rest under loose tented foil lets the fibers relax so juices stay in the meat when carved.',
  },
  {
    q: 'What if my oven runs hot or cold?',
    a: 'Rely on an internal meat probe, not your oven dial. Most residential ovens drift 25°F–50°F off calibration. Keep the oven set to 325°F and monitor the internal thigh probe until it reaches 165°F.',
  },
];

function formatTime(totalMinutes: number): string {
  let m = totalMinutes;
  while (m < 0) m += 24 * 60;
  m = m % (24 * 60);

  const hours24 = Math.floor(m / 60);
  const minutes = m % 60;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

export function BattleBoard({ weight = 16 }: BattleBoardProps) {
  const [dinnerIndex, setDinnerIndex] = useState(2); // Default: 4:00 PM
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const selectedDinner = DINNER_TIMES[dinnerIndex];

  // Dynamic cooking schedule calculated backwards from dinner serving time:
  const timelineSteps = useMemo(() => {
    const dinnerM = selectedDinner.hour * 60 + selectedDinner.minute;
    const step5 = dinnerM - 40;  // 03:20 PM (40m rest)
    const step4 = dinnerM - 45;  // 03:15 PM (temp verify)
    const step2 = dinnerM - 255; // 11:45 AM (approx 3.5 hrs roast)
    const step3 = step2 + 105;   // 01:30 PM (halfway probe insertion)
    const step1 = step2 - 285;   // 07:00 AM (morning air-chill)

    return [
      {
        num: 1,
        time: formatTime(step1),
        title: 'Wake & Air-Chill',
        desc: 'Remove from brine, pat dry thoroughly.',
        gear: 'Leakproof Brine Bags',
        gearUrl: 'https://www.walmart.com/search?q=food+safe+brining+thawing+bags',
        icon: Wind,
        pillText: 'SKIN DRYING',
        pillBg: 'bg-blue-50 text-blue-800 border-blue-200/60',
      },
      {
        num: 2,
        time: formatTime(step2),
        title: 'Oven Entry (325°F)',
        desc: 'Elevate bird on rack so heat circulates 360°.',
        gear: 'V-Rack Roasting Pan',
        gearUrl: 'https://www.walmart.com/search?q=turkey+roasting+pan+v+rack',
        icon: Flame,
        pillText: '360° AIRFLOW',
        pillBg: 'bg-orange-50 text-[#EA580C] border-orange-200/60',
      },
      {
        num: 3,
        time: formatTime(step3),
        title: 'Leave-in Cable Insertion',
        desc: 'Place probe into thickest part of thigh.',
        gear: 'DOT Probe',
        gearUrl: 'https://www.thermoworks.com/dot/',
        icon: Activity,
        pillText: 'THIGH PROBE',
        pillBg: 'bg-amber-50 text-amber-800 border-amber-200/60',
      },
      {
        num: 4,
        time: formatTime(step4),
        title: 'The 165°F Verification',
        desc: 'Spot check breast and wing joint before pulling.',
        gear: 'ThermoPop 2',
        gearUrl: 'https://www.thermoworks.com/thermopop-2/',
        icon: ShieldCheck,
        pillText: '165°F TARGET',
        pillBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
      },
      {
        num: 5,
        time: formatTime(step5),
        title: 'The Heavy Lift & Rest',
        desc: 'Transfer to carving board; rest 40 min.',
        gear: 'Turkey Lifters',
        gearUrl: 'https://www.walmart.com/search?q=turkey+lifters+stainless+steel',
        icon: Utensils,
        pillText: '40 MIN REST',
        pillBg: 'bg-purple-50 text-purple-800 border-purple-200/60',
      },
    ];
  }, [selectedDinner]);

  return (
    <section id="battle-board" className="pt-32 sm:pt-36 pb-0 scroll-mt-28">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-left">
          <div className="text-xs font-bold uppercase tracking-widest text-[#EA580C] font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>T-MINUS INTERACTIVE TIMELINE</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.03em] mt-2 text-[#111111]">
            The Thanksgiving Cook-Day Battle Board.
          </h2>
          <p className="text-stone-600 mt-2 text-base md:text-lg max-w-2xl font-normal">
            Defrosting is only half the battle. Set your dinner time to reveal your exact minute-by-minute oven and resting schedule.
          </p>
        </div>

        {/* Top Interactive Pill Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-start gap-3">
          <div className="relative inline-flex items-center bg-white border border-stone-200/90 rounded-full px-4 py-2 shadow-sm">
            <Clock className="w-4 h-4 text-stone-400 mr-2 shrink-0" />
            <span className="text-xs font-medium text-stone-500 mr-2">Dinner Time:</span>
            <select
              value={dinnerIndex}
              onChange={(e) => setDinnerIndex(Number(e.target.value))}
              aria-label="Target Dinner Serving Time"
              className="bg-transparent text-xs font-bold text-[#111111] focus:outline-none cursor-pointer pr-3"
            >
              {DINNER_TIMES.map((opt, i) => (
                <option key={opt.label} value={i}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="inline-flex items-center bg-white border border-stone-200/90 rounded-full px-4 py-2 shadow-sm text-xs font-mono text-stone-700">
            <span className="text-stone-400 mr-2">Bird:</span>
            <span className="font-bold text-[#111111]">{weight} lbs (Standard Roast)</span>
          </div>
        </div>

        {/* 5-Column Milestone Grid (100% Vector UI — NO Turkey Images!) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mt-10 items-stretch">
          {timelineSteps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all hover:scale-[1.01]"
              >
                <div>
                  {/* Card Header: Numbered Orange Badge + Dynamic Timestamp */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
                    <span className="w-6 h-6 rounded-full bg-[#EA580C] text-white text-[11px] font-mono font-bold flex items-center justify-center shadow-xs">
                      {s.num}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-mono font-bold">
                      {s.time}
                    </span>
                  </div>

                  {/* Sleek Central Custom Vector Graphic Box */}
                  <div className="h-28 rounded-2xl bg-gradient-to-br from-stone-50 to-orange-50/40 border border-stone-200/60 flex flex-col items-center justify-center gap-2 mb-4 p-2 text-center">
                    <div className="w-10 h-10 rounded-xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-center text-[#EA580C]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold tracking-wider ${s.pillBg}`}>
                      {s.pillText}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-[#111111] leading-snug">
                    {s.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-xs text-stone-600 leading-relaxed font-normal">
                    {s.desc}
                  </p>
                </div>

                {/* Bottom Affiliate Gear Pill */}
                <div className="mt-5 pt-3.5 border-t border-stone-100">
                  <a
                    href={s.gearUrl}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 w-full px-3 py-2 rounded-full bg-stone-50 hover:bg-stone-100 border border-stone-200/90 text-[11px] font-semibold text-stone-700 hover:text-stone-900 transition shadow-2xs"
                  >
                    <span className="text-[#EA580C]">✦</span>
                    <span className="truncate">Gear: {s.gear}</span>
                    <ExternalLink className="w-3 h-3 text-stone-400 shrink-0 ml-0.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2x2 FAQ Grid */}
        <div id="faq" className="mt-16 mb-24 scroll-mt-24">
          <div className="bg-white rounded-3xl p-7 sm:p-10 border border-stone-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left FAQ Intro (4 cols) */}
              <div className="lg:col-span-4 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100/90 text-[#EA580C] flex items-center justify-center font-bold">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
                  Frequently Asked Questions
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Quick answers for a smooth, stress-free Thanksgiving dinner schedule.
                </p>
              </div>

              {/* Right 2x2 Accordions (8 cols) */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-stone-200/80 rounded-2xl overflow-hidden transition-all shadow-2xs bg-stone-50/30"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-stone-50 transition-colors"
                      >
                        <span className="text-xs sm:text-sm font-bold text-[#111111] leading-snug">{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-stone-400 shrink-0 mt-0.5 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-stone-900' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-stone-600 leading-relaxed border-t border-stone-100 bg-white">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monolithic Obsidian Footer */}
      <footer className="w-full bg-[#111111] text-stone-400 py-12 px-6 border-t border-stone-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-stone-800">
          {/* Left: Brand Identity */}
          <div className="space-y-2 max-w-xs">
            <div className="inline-flex items-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#EA580C] shrink-0"
              >
                <path
                  d="M12 2L12.5 4.3C12.7 5.1 13.4 5.8 14.2 6L16.5 6.5L14.2 7C13.4 7.2 12.7 7.9 12.5 8.7L12 11L11.5 8.7C11.3 7.9 10.6 7.2 9.8 7L7.5 6.5L9.8 6C10.6 5.8 11.3 5.1 11.5 4.3L12 2Z"
                  fill="#EA580C"
                />
                <path d="M5 16.5C5 11.8 8.1 8 12 8C15.9 8 19 11.8 19 16.5H5Z" fill="#EA580C" />
                <rect x="3" y="17.5" width="18" height="2" rx="1" fill="#EA580C" />
              </svg>
              <span className="text-white font-bold text-base tracking-tight">TurkeyThaw</span>
            </div>
            <p className="text-xs text-stone-400 font-normal">
              Safe. Simple. Thanksgiving Ready.
            </p>
          </div>

          {/* Center: FTC Affiliate Disclosure */}
          <div className="max-w-xl text-xs text-stone-400 leading-relaxed font-normal">
            TurkeyThaw participates in affiliate programs with ThermoWorks and Walmart. We earn a commission on qualifying purchases at zero added cost to you. Built strictly to USDA food safety standards.
          </div>

          {/* Right: Legal & Back to Top */}
          <div className="flex items-center gap-5">
            <a href="#usda-guide" className="text-xs text-stone-400 hover:text-white transition">
              Privacy
            </a>
            <a href="#usda-guide" className="text-xs text-stone-400 hover:text-white transition">
              Terms
            </a>
            <a
              href="https://www.fsis.usda.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-stone-400 hover:text-white transition"
            >
              USDA Guidelines
            </a>
            <a
              href="#top"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-200 hover:text-white transition shadow-sm border border-stone-700"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Bottom line */}
        <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <span>&copy; {new Date().getFullYear()} TurkeyThaw (turkeythaw.com). All rights reserved.</span>
          <span className="font-mono text-[11px] text-stone-500">
            100% Client-Side Engine · Cloudflare Pages Edge Static
          </span>
        </div>
      </footer>
    </section>
  );
}
