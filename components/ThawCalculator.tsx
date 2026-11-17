"use client";

import React, { useState, useMemo } from "react";
import { Calendar, Clock, Download, ChevronDown, Check, Sparkles } from "lucide-react";

const WEIGHT_OPTIONS = [12, 14, 16, 18, 20, 24];

const TIME_OPTIONS = [
  { label: "09:00 AM (Oven Entry)", hour: 9, minute: 0 },
  { label: "11:00 AM (Oven Entry)", hour: 11, minute: 0 },
  { label: "01:00 PM (Oven Entry)", hour: 13, minute: 0 },
  { label: "03:00 PM (Oven Entry)", hour: 15, minute: 0 },
];

export interface ThawCalculatorProps {
  weight?: number;
  onWeightChange?: (w: number) => void;
  method?: "fridge" | "water";
  onMethodChange?: (m: "fridge" | "water") => void;
}

export function ThawCalculator({
  weight: controlledWeight,
  onWeightChange,
  method: controlledMethod,
  onMethodChange,
}: ThawCalculatorProps = {}) {
  const [internalWeight, setInternalWeight] = useState<number>(16);
  const weight = controlledWeight ?? internalWeight;

  const setWeight = (w: number) => {
    setInternalWeight(w);
    onWeightChange?.(w);
  };

  const [internalMethod, setInternalMethod] = useState<"fridge" | "water">("fridge");
  const method = controlledMethod ?? internalMethod;

  const setMethod = (m: "fridge" | "water") => {
    setInternalMethod(m);
    onMethodChange?.(m);
  };

  const [targetDate, setTargetDate] = useState<string>("2026-11-26");
  const [targetTimeIdx, setTargetTimeIdx] = useState<number>(2); // 01:00 PM

  const servings = useMemo(() => {
    const min = Math.round(weight * 0.7);
    const max = Math.round(weight * 0.88);
    return `Average ${min}–${max} Servings`;
  }, [weight]);

  const schedule = useMemo(() => {
    const selectedTime = TIME_OPTIONS[targetTimeIdx];
    const [year, month, day] = targetDate.split("-").map(Number);
    const readyDate = new Date(year, month - 1, day, selectedTime.hour, selectedTime.minute);

    // USDA rules: Fridge = 24 hrs per 4 lbs (~6 hrs/lb), Cold Water = 30 min/lb (0.5 hrs/lb)
    const totalHours = method === "fridge" ? Math.ceil(weight / 4) * 24 : Math.ceil(weight * 0.5);
    const startDate = new Date(readyDate.getTime() - totalHours * 60 * 60 * 1000);

    const formattedStart = startDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const formattedHour = startDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    const durationLabel =
      method === "fridge"
        ? `Total duration: ~${Math.round(totalHours / 24)} Days (${totalHours} hrs)`
        : `Total duration: ~${totalHours} Hours`;

    return {
      startDate,
      readyDate,
      display: `${formattedStart} · ${formattedHour}`,
      durationLabel,
      fridgeDays: Math.ceil(weight / 4),
      waterHours: Math.ceil(weight * 0.5),
    };
  }, [weight, method, targetDate, targetTimeIdx]);

  const handleDownloadICS = () => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const toICSDate = (d: Date) =>
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//TurkeyThaw//Holiday Schedule//EN",
      "BEGIN:VEVENT",
      `DTSTART:${toICSDate(schedule.startDate)}`,
      `DTEND:${toICSDate(new Date(schedule.startDate.getTime() + 30 * 60 * 1000))}`,
      `SUMMARY:Start Thawing ${weight} lb Turkey (${method === "fridge" ? "Refrigerator" : "Cold Water"})`,
      `DESCRIPTION:${schedule.durationLabel}. Target safe internal temp: 165°F.`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `turkey-thaw-${weight}lbs.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGoogleCalendar = () => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const fmt = (d: Date) =>
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    const end = new Date(schedule.startDate.getTime() + 30 * 60 * 1000);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      `Start Thawing ${weight} lb Turkey`
    )}&dates=${fmt(schedule.startDate)}/${fmt(end)}&details=${encodeURIComponent(schedule.durationLabel)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="calculator" className="relative w-full py-12 sm:py-16 overflow-hidden bg-[#FAF9F5]">
      {/* Full-Bleed Panoramic Top-Right Watercolor Artwork (Zero Overlap with Cards) */}
      <div
        className="hidden md:block absolute top-0 right-0 w-[62%] lg:w-[58%] h-[290px] sm:h-[320px] pointer-events-none select-none z-0"
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 32%, black 100%)",
          maskImage: "linear-gradient(to right, transparent 0%, black 32%, black 100%)",
        }}
      >
        <img
          src="/assets/watercolor-scale-accent.png"
          alt=""
          className="w-full h-full object-cover object-right-top mix-blend-multiply"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Header */}
        <div className="max-w-2xl mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 text-[#EA580C] text-xs font-mono font-bold tracking-widest uppercase mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TIMED TO THE EXACT HOUR</span>
          </div>
          <h2 className="font-sans text-4xl sm:text-5xl lg:text-[52px] font-bold tracking-[-0.03em] leading-[1.06] text-[#111111]">
            Calculate your backwards holiday schedule.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
            Select your bird&apos;s weight and preferred thawing method to pinpoint the exact moment prep begins.
          </p>
        </div>

        {/* 60 / 40 Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Card (60% Width -> 7 cols): Controls */}
          <div className="lg:col-span-7 rounded-3xl bg-white border border-stone-200/80 p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
            {/* 1. Turkey Weight */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm sm:text-base font-bold text-[#111111]">1. Turkey Weight</label>
                <span className="text-xs sm:text-sm font-mono text-stone-500">{servings}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
                {WEIGHT_OPTIONS.map((w) => {
                  const active = weight === w;
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeight(w)}
                      className={`py-2.5 px-3 rounded-full text-xs sm:text-sm transition cursor-pointer select-none text-center ${
                        active
                          ? "bg-[#EA580C] text-white font-bold shadow-xs"
                          : "bg-white hover:bg-stone-50 text-stone-700 font-medium border border-stone-200/90"
                      }`}
                    >
                      {w} lbs
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Thawing Method */}
            <div>
              <label className="block text-sm sm:text-base font-bold text-[#111111] mb-3">2. Thawing Method</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Refrigerator Thaw */}
                <button
                  type="button"
                  onClick={() => setMethod("fridge")}
                  className={`relative text-left p-4 rounded-2xl transition flex items-center gap-3.5 cursor-pointer ${
                    method === "fridge"
                      ? "border border-[#EA580C] bg-[#FFFBF7] shadow-xs"
                      : "border border-stone-200/90 bg-white hover:bg-stone-50/70"
                  }`}
                >
                  {method === "fridge" && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#EA580C] text-white flex items-center justify-center shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                  <img
                    src="/assets/watercolor-fridge.png"
                    alt="Refrigerator Thaw"
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain shrink-0 mix-blend-multiply"
                  />
                  <div className="min-w-0 pr-4">
                    <div className="font-bold text-sm sm:text-base text-[#111111] leading-tight">Refrigerator Thaw</div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E8F5E9] text-[#2E7D32]">
                      Recommended · ~{schedule.fridgeDays} days
                    </span>
                    <p className="mt-1 text-[11px] sm:text-xs text-stone-500">24 hrs per 4–5 lbs (Under 40°F)</p>
                  </div>
                </button>

                {/* Cold Water Bath */}
                <button
                  type="button"
                  onClick={() => setMethod("water")}
                  className={`relative text-left p-4 rounded-2xl transition flex items-center gap-3.5 cursor-pointer ${
                    method === "water"
                      ? "border border-[#EA580C] bg-[#FFFBF7] shadow-xs"
                      : "border border-stone-200/90 bg-white hover:bg-stone-50/70"
                  }`}
                >
                  {method === "water" && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#EA580C] text-white flex items-center justify-center shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                  <img
                    src="/assets/watercolor-ice-bowl.png"
                    alt="Cold Water Bath"
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain shrink-0 mix-blend-multiply"
                  />
                  <div className="min-w-0 pr-4">
                    <div className="font-bold text-sm sm:text-base text-[#111111] leading-tight">Cold Water Bath</div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF3E0] text-[#E65100]">
                      Fast · ~{schedule.waterHours} hours
                    </span>
                    <p className="mt-1 text-[11px] sm:text-xs text-stone-500">30 min/lb (Change water q30m)</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Target Ready Date & Time */}
            <div>
              <label className="block text-sm sm:text-base font-bold text-[#111111] mb-3">
                3. Target Ready Date &amp; Time
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="relative h-12 px-4 rounded-2xl bg-white border border-stone-200/90 flex items-center justify-between text-xs sm:text-sm text-stone-800 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-stone-500 shrink-0" />
                    <span className="font-semibold">Thanksgiving Day · Thu, Nov 26</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-stone-400 shrink-0 pointer-events-none" />
                </div>

                <div className="relative h-12 px-4 rounded-2xl bg-white border border-stone-200/90 flex items-center text-xs sm:text-sm text-stone-800 shadow-2xs focus-within:border-[#EA580C]">
                  <Clock className="w-4 h-4 text-stone-500 shrink-0 mr-2.5" />
                  <select
                    value={targetTimeIdx}
                    onChange={(e) => setTargetTimeIdx(Number(e.target.value))}
                    aria-label="Target Oven Time"
                    className="appearance-none bg-transparent font-semibold text-stone-800 w-full pr-6 focus:outline-none cursor-pointer"
                  >
                    {TIME_OPTIONS.map((t, idx) => (
                      <option key={t.label} value={idx}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-stone-400 pointer-events-none absolute right-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Stack (40% Width -> 5 cols): Golden-Cream Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Top Card: START THAWING Result */}
            <div className="rounded-3xl bg-[#FBF1E3] border border-[#E5B98B] p-6 shadow-xs flex items-center gap-5">
              <img
                src="/assets/roasted-turkey-thumb.png"
                alt="Roasted Thanksgiving Turkey"
                className="w-32 h-32 sm:w-36 sm:h-36 object-contain shrink-0 mix-blend-multiply"
              />
              <div className="flex-1 min-w-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F5DEC3] text-[#EA580C] text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase">
                  ● START THAWING
                </span>
                <div className="mt-1.5 text-xl sm:text-2xl lg:text-[26px] font-bold tracking-tight leading-tight text-[#111111]">
                  {schedule.display}
                </div>
                <p className="mt-1 text-xs sm:text-sm text-stone-600">{schedule.durationLabel}</p>

                {/* Two side-by-side buttons placed directly under the text on the right side */}
                <div className="flex items-center gap-2 sm:gap-2.5 mt-3.5">
                  <button
                    type="button"
                    onClick={handleGoogleCalendar}
                    className="py-2 px-3 sm:px-3.5 rounded-full bg-[#111111] hover:bg-neutral-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>+ Add to Calendar</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadICS}
                    className="py-2 px-3 sm:px-3.5 rounded-full bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .ICS</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Card: CPA Grocery Offer */}
            <div className="rounded-3xl bg-[#FBF1E3] border border-[#E5B98B] p-6 shadow-xs flex items-center gap-5">
              <img
                src="/assets/watercolor-gift-basket.png"
                alt="$100 Thanksgiving Grocery Gift Basket"
                className="w-32 h-32 sm:w-36 sm:h-36 object-contain shrink-0 mix-blend-multiply"
              />
              <div className="flex-1 min-w-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F5DEC3] border border-orange-200/60 text-[#EA580C] text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase">
                  ✦ THANKSGIVING GROCERY BONUS · US ONLY
                </span>
                <h3 className="mt-1.5 text-sm sm:text-base font-bold text-[#111111] leading-snug">
                  Claim a $100 Walmart or Target Thanksgiving Gift Card
                </h3>
                <p className="mt-1 text-[11px] sm:text-xs text-stone-600 leading-relaxed">
                  Preparing your holiday dinner? Check eligibility for a $100 grocery voucher while supplies last.
                </p>
                <a
                  href="https://YOUR-CPA-LINK-HERE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs sm:text-sm font-bold transition shadow-xs whitespace-nowrap cursor-pointer"
                >
                  <span>Claim $100 Voucher</span>
                  <span className="font-bold">↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Strip */}
        <div className="mt-6 rounded-2xl sm:rounded-full bg-white border border-stone-200/80 py-3.5 px-6 sm:px-10 shadow-xs flex flex-col sm:flex-row items-center justify-around gap-3 text-xs sm:text-sm font-medium text-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#EA580C] text-white flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span>Brining Window (8–12 hrs)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#EA580C] text-white flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span>Fridge Placement</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#EA580C] text-white flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span>Final Temp Check (165°F)</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ThawCalculator;
