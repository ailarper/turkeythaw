'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  CalendarPlus,
  Download,
  Check,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

const WEIGHT_PRESETS = [12, 14, 16, 18, 20, 24];

function getNextThanksgiving(): Date {
  const now = new Date();
  let year = now.getFullYear();
  const getThanksgivingForYear = (y: number) => {
    const nov1 = new Date(y, 10, 1);
    const dayOfWeek = nov1.getDay();
    const firstThursdayOffset = (4 - dayOfWeek + 7) % 7;
    const fourthThursdayDate = 1 + firstThursdayOffset + 21;
    return new Date(y, 10, fourthThursdayDate, 13, 0, 0);
  };

  let thanksgiving = getThanksgivingForYear(year);
  if (now.getTime() > thanksgiving.getTime() + 24 * 60 * 60 * 1000) {
    year += 1;
    thanksgiving = getThanksgivingForYear(year);
  }
  return thanksgiving;
}

function formatScheduleDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatScheduleTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function toGoogleCalendarTimestamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export interface ThawCalculatorProps {
  weight?: number;
  onWeightChange?: (w: number) => void;
  method?: 'fridge' | 'water';
  onMethodChange?: (m: 'fridge' | 'water') => void;
}

export function ThawCalculator({
  weight: controlledWeight,
  onWeightChange,
  method: controlledMethod,
  onMethodChange,
}: ThawCalculatorProps) {
  const [internalWeight, setInternalWeight] = useState<number>(16);
  const weight = controlledWeight ?? internalWeight;

  const handleSelectWeight = (w: number) => {
    setInternalWeight(w);
    if (onWeightChange) onWeightChange(w);
  };

  const [internalMethod, setInternalMethod] = useState<'fridge' | 'water'>('fridge');
  const method = controlledMethod ?? internalMethod;

  const handleSelectMethod = (m: 'fridge' | 'water') => {
    setInternalMethod(m);
    if (onMethodChange) onMethodChange(m);
  };

  const [targetDate, setTargetDate] = useState<Date>(() => getNextThanksgiving());
  const [targetTimeString, setTargetTimeString] = useState<string>('13:00');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const servings = useMemo(() => {
    const minS = Math.round(weight * 0.7);
    const maxS = Math.round(weight * 0.9);
    return `Average ${minS}–${maxS} Servings`;
  }, [weight]);

  const calculation = useMemo(() => {
    let durationHours = 0;
    if (method === 'fridge') {
      const daysNeeded = Math.ceil(weight / 4.0);
      durationHours = daysNeeded * 24;
    } else {
      const minutesNeeded = weight * 30;
      durationHours = Math.ceil(minutesNeeded / 60);
    }

    const startTime = new Date(targetDate.getTime() - durationHours * 60 * 60 * 1000);
    const days = Math.round((durationHours / 24) * 10) / 10;

    return {
      durationHours,
      durationLabel:
        method === 'fridge' ? `~${Math.round(days)} Days (${durationHours} hrs)` : `~${durationHours} Hours`,
      startTime,
      days,
    };
  }, [weight, method, targetDate]);

  function handleTimeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setTargetTimeString(e.target.value);
    const [hours, mins] = e.target.value.split(':').map(Number);
    const newTarget = new Date(targetDate);
    newTarget.setHours(hours, mins, 0, 0);
    setTargetDate(newTarget);
  }

  function generateGoogleCalendarUrl(): string {
    const title = encodeURIComponent(
      `Start Thawing Turkey (${weight} lbs · ${method === 'fridge' ? 'Fridge' : 'Cold Water'})`
    );
    const details = encodeURIComponent(
      `USDA Food Safety Thawing Schedule:\n- Method: ${
        method === 'fridge'
          ? 'Refrigerator (kept at 40°F / 4°C or below on bottom shelf tray)'
          : 'Cold Water Bath (keep in leakproof bag, change water every 30 mins)'
      }\n- Weight: ${weight} lbs\n- Target Oven Time: ${targetDate.toLocaleString()}\n- Safe Internal Target: 165°F verified with digital probe.\n\nCalculated by TurkeyThaw (turkeythaw.pages.dev)`
    );
    const startStr = toGoogleCalendarTimestamp(calculation.startTime);
    const endStr = toGoogleCalendarTimestamp(targetDate);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${startStr}/${endStr}`;
  }

  function downloadIcs() {
    const startStr = calculation.startTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const endStr = targetDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TurkeyThaw//Holiday Thaw Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:turkey-thaw-${Date.now()}@turkeythaw.pages.dev`,
      `DTSTAMP:${toGoogleCalendarTimestamp(new Date())}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:Start Thawing Turkey (${weight} lbs · ${method === 'fridge' ? 'Fridge' : 'Cold Water'})`,
      `DESCRIPTION:USDA Food Safety Thawing Schedule. Keep submerged or under 40°F. Target 165°F. Calculated by TurkeyThaw (turkeythaw.pages.dev)`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `turkey-thaw-schedule-${weight}lbs.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Section Header Area with Watercolor Brass Scale & Timer Background Accent */}
      <div className="relative mb-8 sm:mb-10 min-h-[170px] sm:min-h-[190px] lg:min-h-[220px] flex items-center justify-between">
        {/* Watercolor Scale Accent Image in Top-Right Background */}
        <div className="hidden md:flex absolute top-0 right-0 h-full max-h-[240px] items-center justify-end pointer-events-none select-none z-0">
          <img
            src="/assets/watercolor-scale-accent.png"
            alt="Vintage brass kitchen scale, analog timer, and fresh herbs"
            className="h-full max-h-[240px] w-auto object-contain mix-blend-multiply opacity-95"
          />
        </div>

        {/* Left-Aligned Header Text Block */}
        <div className="relative z-10 max-w-2xl text-left pr-4">
          <div className="inline-flex items-center gap-1.5 text-[#EA580C] text-xs font-mono font-bold tracking-wider mb-2.5">
            <span>✦</span>
            <span>TIMED TO THE EXACT HOUR</span>
          </div>
          <h2 className="font-sans text-4xl sm:text-5xl lg:text-[52px] font-bold tracking-tight leading-[1.08] text-[#111111]">
            Calculate your backwards holiday schedule.
          </h2>
          <p className="text-stone-600 mt-2 text-sm sm:text-base md:text-lg font-normal">
            Select your bird&apos;s weight and preferred thawing method to pinpoint the exact moment prep begins.
          </p>
        </div>
      </div>

      {/* 2. Balanced 60/40 Two-Column Grid (lg:grid-cols-12 gap-6) */}
      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mt-6">
        {/* Left Column (lg:col-span-7) — Calculator Controls Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6 flex flex-col justify-between">
          {/* 1. Turkey Weight */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-[#111111]">1. Turkey Weight</label>
              <span className="text-xs font-mono font-medium text-stone-500">{servings}</span>
            </div>
            {/* 6 pill buttons */}
            <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
              {WEIGHT_PRESETS.map((p) => {
                const active = weight === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleSelectWeight(p)}
                    className={`h-10 sm:h-11 rounded-full text-xs sm:text-sm font-bold tracking-tight transition-all select-none cursor-pointer flex items-center justify-center ${
                      active
                        ? 'bg-[#EA580C] text-white shadow-xs'
                        : 'bg-white hover:bg-stone-50 text-stone-800 border border-stone-200/90'
                    }`}
                  >
                    {p} <span className="text-[10px] sm:text-[11px] font-normal ml-0.5">lbs</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Thawing Method */}
          <div>
            <label className="text-sm font-bold text-[#111111] block mb-3">2. Thawing Method</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Refrigerator Thaw */}
              <button
                type="button"
                onClick={() => handleSelectMethod('fridge')}
                className={`relative p-3.5 sm:p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
                  method === 'fridge'
                    ? 'border-2 border-[#EA580C] bg-[#FFFBF7] shadow-xs'
                    : 'border border-stone-200/80 bg-white hover:bg-stone-50/60'
                }`}
              >
                {method === 'fridge' && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 sm:w-5 sm:h-5 bg-[#EA580C] text-white rounded-full flex items-center justify-center shadow-xs">
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                  </div>
                )}
                <img
                  src="/assets/watercolor-fridge.png"
                  alt="Refrigerator Thaw"
                  className="w-12 h-14 sm:w-14 sm:h-16 object-contain shrink-0 mix-blend-multiply"
                />
                <div className="min-w-0 pr-4">
                  <div className="text-sm font-bold text-[#111111] leading-tight">Refrigerator Thaw</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-[#E8F5E9] text-[#2E7D32]">
                    Recommended · ~4 days
                  </span>
                  <div className="text-[11px] text-stone-500 mt-1">24 hrs per 4–5 lbs (Under 40°F)</div>
                </div>
              </button>

              {/* Cold Water Bath */}
              <button
                type="button"
                onClick={() => handleSelectMethod('water')}
                className={`relative p-3.5 sm:p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
                  method === 'water'
                    ? 'border-2 border-[#EA580C] bg-[#FFFBF7] shadow-xs'
                    : 'border border-stone-200/80 bg-white hover:bg-stone-50/60'
                }`}
              >
                {method === 'water' && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 sm:w-5 sm:h-5 bg-[#EA580C] text-white rounded-full flex items-center justify-center shadow-xs">
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                  </div>
                )}
                <img
                  src="/assets/watercolor-ice-bowl.png"
                  alt="Cold Water Bath"
                  className="w-12 h-14 sm:w-14 sm:h-16 object-contain shrink-0 mix-blend-multiply"
                />
                <div className="min-w-0 pr-4">
                  <div className="text-sm font-bold text-[#111111] leading-tight">Cold Water Bath</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-[#FFF3E0] text-[#E65100]">
                    Fast · ~8 hours
                  </span>
                  <div className="text-[11px] text-stone-500 mt-1">30 min/lb (Change water q30m)</div>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Target Ready Date & Time */}
          <div>
            <label className="text-sm font-bold text-[#111111] block mb-3">3. Target Ready Date &amp; Time</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Date Display Pill */}
              <div className="h-12 px-4 bg-white border border-stone-200/90 rounded-2xl flex items-center justify-between text-xs font-medium text-stone-800 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-stone-500 shrink-0" />
                  <span className="font-semibold text-stone-900">Thanksgiving Day · Thu, Nov 26</span>
                </div>
                <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
              </div>

              {/* Time Select Pill */}
              <div className="relative h-12 px-4 bg-white border border-stone-200/90 rounded-2xl flex items-center justify-between text-xs font-medium text-stone-800 shadow-2xs focus-within:border-[#EA580C]">
                <div className="flex items-center gap-2.5 w-full">
                  <Clock className="w-4 h-4 text-stone-500 shrink-0" />
                  <select
                    value={targetTimeString}
                    onChange={handleTimeChange}
                    aria-label="Target Oven Time"
                    className="appearance-none bg-transparent font-semibold text-stone-900 focus:outline-none cursor-pointer w-full pr-6 text-xs"
                  >
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">01:00 PM (Oven Entry)</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                  </select>
                </div>
                <ChevronDown className="w-4 h-4 text-stone-400 shrink-0 pointer-events-none absolute right-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Stack (lg:col-span-5 flex flex-col gap-6) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Top Card: START THAWING Result Card */}
          <div className="bg-[#FDF8F3] border border-orange-200/70 rounded-3xl p-5 sm:p-6 shadow-xs flex-1 flex flex-col justify-between">
            <div className="flex items-center gap-4 sm:gap-5">
              <img
                src="/assets/roasted-turkey-thumb.png"
                alt="Roasted Holiday Turkey"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain shrink-0 mix-blend-multiply"
              />
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FCE8D8] text-[#EA580C] text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase">
                  ✦ START THAWING
                </span>
                <h3 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#111111] block mt-1 leading-[1.08]">
                  {mounted
                    ? `${formatScheduleDate(calculation.startTime)} · ${formatScheduleTime(calculation.startTime)}`
                    : 'Sun, Nov 22 · 1:00 PM'}
                </h3>
                <span className="text-xs sm:text-sm text-stone-600 mt-1 block">
                  Total duration: {calculation.durationLabel}
                </span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-2.5 sm:gap-3 mt-5 pt-1">
              <a
                href={generateGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#111111] hover:bg-neutral-800 text-white rounded-full py-2.5 px-3 text-xs sm:text-[13px] font-semibold tracking-tight transition shadow-xs text-center whitespace-nowrap"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                <span>+ Add to Calendar</span>
              </a>

              <button
                type="button"
                onClick={downloadIcs}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-full py-2.5 px-3 text-xs sm:text-[13px] font-semibold tracking-tight transition shadow-xs text-center whitespace-nowrap cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                <span>Download .ICS</span>
              </button>
            </div>
          </div>

          {/* Bottom Card: CPA Grocery Offer Card */}
          <div className="bg-gradient-to-br from-[#FFFDF9] to-[#FFF5EC] border border-orange-200/80 rounded-3xl p-5 sm:p-6 shadow-xs flex-1 flex flex-col justify-between">
            <div className="flex items-center gap-4 sm:gap-5">
              <img
                src="/assets/watercolor-gift-basket.png"
                alt="$100 Thanksgiving Grocery Voucher"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain shrink-0 mix-blend-multiply"
              />
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF0E5] text-[#EA580C] text-[10px] font-mono font-bold tracking-wider uppercase border border-orange-200/50">
                  ✦ THANKSGIVING GROCERY BONUS · US ONLY
                </span>
                <h4 className="text-base sm:text-lg font-bold text-[#111111] tracking-tight leading-snug mt-1">
                  Claim a $100 Walmart or Target Thanksgiving Gift Card
                </h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed line-clamp-2">
                  Preparing your holiday dinner? Check eligibility for a $100 grocery voucher while supplies last.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-4 pt-1">
              <a
                href="https://YOUR-CPA-LINK-HERE"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-full transition-all duration-150 shadow-xs hover:shadow cursor-pointer"
              >
                <span>Claim $100 Voucher</span>
                <span className="font-bold">↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Full-Width Trust Bar */}
      <div className="w-full mt-6 bg-white border border-stone-200/80 rounded-2xl sm:rounded-3xl py-3.5 px-6 sm:px-10 shadow-xs flex flex-col sm:flex-row items-center justify-around gap-4 text-xs sm:text-sm font-semibold text-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-full bg-[#EA580C] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
          <span>Brining Window (8–12 hrs)</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-full bg-[#EA580C] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
          <span>Fridge Placement</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-full bg-[#EA580C] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
          <span>Final Temp Check (165°F)</span>
        </div>
      </div>
    </div>
  );
}

export default ThawCalculator;
