'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  CalendarPlus,
  Download,
  Refrigerator,
  Droplets,
  CalendarClock,
  Check,
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
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/80 text-[#EA580C] text-xs font-mono font-bold tracking-wider mb-2.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TIMED TO THE EXACT HOUR</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] text-[#111111]">
          Calculate your backwards holiday schedule.
        </h2>
        <p className="text-stone-600 mt-2 text-sm sm:text-base md:text-lg font-normal">
          Select your bird&apos;s weight and preferred thawing method to pinpoint the exact moment prep begins.
        </p>
      </div>

      {/* Main Centered Turkey Weight & Thawing Calculator Card */}
      <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl p-5 sm:p-7 md:p-8 border border-stone-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-6 sm:space-y-7">
        {/* 1. Turkey Weight Selector */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-[#111111]">1. Turkey Weight</label>
            <span className="text-xs font-mono font-medium text-stone-500">{servings}</span>
          </div>
          {/* Responsive Weight Selection Row */}
          <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-1 sm:gap-2 text-xs sm:text-sm w-full max-w-full">
            {WEIGHT_PRESETS.map((p) => {
              const active = weight === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSelectWeight(p)}
                  className={`flex-1 min-w-[46px] sm:min-w-0 h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all select-none cursor-pointer ${
                    active
                      ? 'bg-[#EA580C] text-white shadow-sm scale-[1.02]'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80'
                  }`}
                >
                  {p} <span className="text-[10px] sm:text-[11px] font-normal">lbs</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Thawing Method: Single column on small screens, 2-col on sm+ */}
        <div>
          <label className="text-sm font-bold text-[#111111] block mb-3">2. Thawing Method</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-full">
            {/* Refrigerator Thaw */}
            <button
              type="button"
              onClick={() => handleSelectMethod('fridge')}
              className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all w-full max-w-full cursor-pointer ${
                method === 'fridge'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600/30'
                  : 'bg-white hover:bg-stone-50 border-stone-200/80'
              }`}
            >
              <div
                className={`mt-0.5 p-2 rounded-xl shrink-0 ${
                  method === 'fridge' ? 'bg-emerald-200/60 text-emerald-800' : 'bg-stone-100 text-stone-600'
                }`}
              >
                <Refrigerator className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#111111]">Refrigerator Thaw</div>
                <div className="text-xs text-emerald-800 font-semibold mt-0.5">Recommended · ~4 days</div>
                <div className="text-[11px] text-stone-500 mt-1">24 hrs per 4–5 lbs (Under 40°F)</div>
              </div>
            </button>

            {/* Cold Water Bath */}
            <button
              type="button"
              onClick={() => handleSelectMethod('water')}
              className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all w-full max-w-full cursor-pointer ${
                method === 'water'
                  ? 'border-[#EA580C] bg-orange-50/50 shadow-sm ring-1 ring-[#EA580C]/30'
                  : 'bg-white hover:bg-stone-50 border-stone-200/80'
              }`}
            >
              <div
                className={`mt-0.5 p-2 rounded-xl shrink-0 ${
                  method === 'water' ? 'bg-orange-200/70 text-[#EA580C]' : 'bg-stone-100 text-stone-600'
                }`}
              >
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#111111]">Cold Water Bath</div>
                <div className="text-xs text-[#EA580C] font-semibold mt-0.5">Fast · ~8 hours</div>
                <div className="text-[11px] text-stone-500 mt-1">30 min/lb (Change water q30m)</div>
              </div>
            </button>
          </div>
        </div>

        {/* 3. Target Ready Date & Time */}
        <div>
          <label className="text-sm font-bold text-[#111111] block mb-3">3. Target Ready Date &amp; Time</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-full">
            <div className="h-11 px-4 bg-stone-50 border border-stone-200/80 rounded-xl flex items-center justify-between text-xs font-medium text-stone-800 w-full max-w-full">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-stone-500" />
                <span className="font-semibold">Thanksgiving Day</span>
              </div>
              <span className="text-stone-500 font-mono">Thu, Nov 26</span>
            </div>

            <div className="relative h-11 px-4 bg-white border border-stone-200/80 rounded-xl flex items-center justify-between text-xs font-medium text-stone-800 focus-within:border-[#EA580C] w-full max-w-full">
              <div className="flex items-center gap-2 w-full">
                <Clock className="w-4 h-4 text-stone-500 shrink-0" />
                <select
                  value={targetTimeString}
                  onChange={handleTimeChange}
                  aria-label="Target Oven Time"
                  className="bg-transparent font-semibold text-stone-900 focus:outline-none cursor-pointer w-full pr-4 text-xs"
                >
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">01:00 PM (Oven Entry)</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                </select>
              </div>
              <span className="text-stone-400 text-[10px] pointer-events-none">▼</span>
            </div>
          </div>
        </div>

        {/* 4. Calculated Result Banner */}
        <div className="bg-[#FBF6EE] border border-orange-200/60 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 w-full max-w-full">
          <div className="flex items-center gap-4">
            {/* Circular Vector Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center shrink-0">
              <CalendarClock className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#EA580C] block">
                START THAWING
              </span>
              <span className="text-2xl md:text-3xl font-bold tracking-tight text-[#111111] block leading-tight mt-0.5">
                {mounted
                  ? `${formatScheduleDate(calculation.startTime)} · ${formatScheduleTime(calculation.startTime)}`
                  : 'Sun, Nov 22 · 9:00 AM'}
              </span>
              <span className="text-xs text-stone-600 mt-1 block">
                Total duration: {calculation.durationLabel}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            <a
              href={generateGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#111111] hover:bg-neutral-800 text-white rounded-full px-4 py-2.5 text-xs font-semibold tracking-tight transition shadow-sm"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-stone-300" />
              <span>+ Add to Calendar</span>
            </a>

            <button
              type="button"
              onClick={downloadIcs}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-full px-4 py-2.5 text-xs font-semibold tracking-tight transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>Download .ICS</span>
            </button>
          </div>
        </div>

        {/* 5. High-Converting CPA Grocery Offer Banner Card */}
        <div className="bg-gradient-to-br from-[#FFFDF9] to-[#FFF5EC] border border-orange-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs transition-all hover:border-orange-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF0E5] text-[#EA580C] text-[10px] font-mono font-bold tracking-wider uppercase border border-orange-200/50">
                <Sparkles className="w-3 h-3 text-[#EA580C]" />
                <span>THANKSGIVING GROCERY BONUS • US ONLY</span>
              </span>
              <h4 className="text-base sm:text-lg font-bold text-[#111111] tracking-tight leading-snug">
                Claim a $100 Walmart or Target Thanksgiving Gift Card
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Preparing your holiday dinner? Check eligibility for a $100 grocery voucher while supplies last.
              </p>
            </div>

            <a
              href="https://YOUR-CPA-LINK-HERE"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-150 shadow-sm hover:shadow-md cursor-pointer shrink-0 w-full sm:w-auto text-center"
            >
              <span>Claim $100 Voucher</span>
              <span className="font-bold">↗</span>
            </a>
          </div>
        </div>

        {/* 6. 3 Mini Milestone Checkmarks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs text-stone-700">
          <div className="flex items-center gap-1.5 font-medium">
            <Check className="w-4 h-4 text-[#EA580C] shrink-0" />
            <span>Brining Window (8–12 hrs)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Check className="w-4 h-4 text-[#EA580C] shrink-0" />
            <span>Fridge Placement</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Final Temp Check (165°F)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThawCalculator;
