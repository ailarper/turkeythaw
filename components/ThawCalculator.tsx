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
  ShoppingBag,
  ExternalLink,
  Thermometer,
  Timer,
  Flame,
  ShieldCheck,
  Utensils,
  Check,
} from 'lucide-react';

const WEIGHT_PRESETS = [12, 14, 16, 18, 20, 24];

const ESSENTIAL_GEAR = [
  {
    name: 'ThermoPop 2 Instant-Read',
    price: '$35',
    tag: '165°F VERIFIED',
    link: 'https://www.thermoworks.com/thermopop-2/',
    store: 'ThermoWorks Direct ↗',
    icon: Thermometer,
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
    iconBg: 'bg-emerald-50 text-emerald-700',
  },
  {
    name: 'DOT Oven Probe Thermometer',
    price: '$45',
    tag: 'LEAVE-IN MONITOR',
    link: 'https://www.thermoworks.com/dot/',
    store: 'ThermoWorks Direct ↗',
    icon: Timer,
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-200/60',
    iconBg: 'bg-blue-50 text-blue-700',
  },
  {
    name: 'Heavy Roasting Pan with V-Rack',
    price: '$28',
    tag: null,
    link: 'https://www.walmart.com/search?q=turkey+roasting+pan+v+rack',
    store: 'Walmart ↗',
    icon: Flame,
    badgeBg: '',
    iconBg: 'bg-orange-50 text-[#EA580C]',
  },
  {
    name: 'Food-Safe Leakproof Thaw Bags',
    price: '$12',
    tag: null,
    link: 'https://www.walmart.com/search?q=food+safe+brining+thawing+bags',
    store: 'Walmart ↗',
    icon: ShieldCheck,
    badgeBg: '',
    iconBg: 'bg-teal-50 text-teal-700',
  },
  {
    name: 'Stainless Steel Turkey Lifters',
    price: '$14',
    tag: null,
    link: 'https://www.walmart.com/search?q=turkey+lifters+stainless+steel',
    store: 'Walmart ↗',
    icon: Utensils,
    badgeBg: '',
    iconBg: 'bg-purple-50 text-purple-700',
  },
];

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

interface ThawCalculatorProps {
  weight?: number;
  onWeightChange?: (w: number) => void;
}

export function ThawCalculator({ weight: controlledWeight, onWeightChange }: ThawCalculatorProps) {
  const [internalWeight, setInternalWeight] = useState<number>(16);
  const weight = controlledWeight ?? internalWeight;

  const handleSelectWeight = (w: number) => {
    setInternalWeight(w);
    if (onWeightChange) onWeightChange(w);
  };

  const [method, setMethod] = useState<'fridge' | 'water'>('fridge');
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
      durationLabel: method === 'fridge' ? `~${Math.round(days)} Days (${durationHours} hrs)` : `~${durationHours} Hours`,
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
      }\n- Weight: ${weight} lbs\n- Target Oven Time: ${targetDate.toLocaleString()}\n- Safe Internal Target: 165°F verified with digital probe.\n\nCalculated by TurkeyThaw (turkeythaw.com)`
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
      `UID:turkey-thaw-${Date.now()}@turkeythaw.com`,
      `DTSTAMP:${toGoogleCalendarTimestamp(new Date())}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:Start Thawing Turkey (${weight} lbs · ${method === 'fridge' ? 'Fridge' : 'Cold Water'})`,
      `DESCRIPTION:USDA Food Safety Thawing Schedule. Keep submerged or under 40°F. Target 165°F. Calculated by TurkeyThaw.com`,
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
    <section id="calculator" className="pt-32 sm:pt-36 pb-20 px-6 max-w-6xl mx-auto scroll-mt-28">
      {/* Section Header */}
      <div className="text-left">
        <div className="text-xs font-bold uppercase tracking-widest text-[#EA580C] font-mono flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TIMED TO THE EXACT HOUR</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.03em] mt-2 text-[#111111]">
          Calculate your backwards holiday schedule.
        </h2>
        <p className="text-stone-600 mt-2 text-base md:text-lg max-w-2xl font-normal">
          Select your bird&apos;s weight and preferred thawing method to pinpoint the exact moment prep begins.
        </p>
      </div>

      {/* 2-Column Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12 items-start">
        {/* LEFT CARD (7 cols): Engine Controls & Result Banner */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-7 sm:p-8 border border-stone-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-7">
          {/* 1. Turkey Weight Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-[#111111]">1. Turkey Weight</label>
              <span className="text-xs font-mono font-medium text-stone-500">{servings}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {WEIGHT_PRESETS.map((p) => {
                const active = weight === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleSelectWeight(p)}
                    className={`h-11 rounded-xl text-sm font-bold tracking-tight transition-all ${
                      active
                        ? 'bg-[#EA580C] text-white shadow-sm scale-[1.02]'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80'
                    }`}
                  >
                    {p} <span className="text-[11px] font-normal">lbs</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Thawing Method Side-by-Side Cards */}
          <div>
            <label className="text-sm font-bold text-[#111111] block mb-3">2. Thawing Method</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Refrigerator Thaw */}
              <button
                type="button"
                onClick={() => setMethod('fridge')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
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
                onClick={() => setMethod('water')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="h-11 px-4 bg-stone-50 border border-stone-200/80 rounded-xl flex items-center justify-between text-xs font-medium text-stone-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-stone-500" />
                  <span className="font-semibold">Thanksgiving Day</span>
                </div>
                <span className="text-stone-500 font-mono">Thu, Nov 26</span>
              </div>

              <div className="relative h-11 px-4 bg-white border border-stone-200/80 rounded-xl flex items-center justify-between text-xs font-medium text-stone-800 focus-within:border-[#EA580C]">
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

          {/* 4. Calculated Result Banner (100% Vector UI — NO Turkey Photo Box!) */}
          <div className="bg-[#FBF6EE] border border-orange-200/60 rounded-2xl p-6 mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
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

          {/* 3 Mini Milestone Checkmarks */}
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

        {/* RIGHT CARD (5 cols): Essential Holiday Gear (NO Rectangular Photos) */}
        <div id="prep-kit" className="lg:col-span-5 bg-white rounded-3xl p-7 sm:p-8 border border-stone-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-stone-100">
            <div className="w-10 h-10 rounded-2xl bg-orange-100/80 text-[#EA580C] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#111111] tracking-tight">Essential Holiday Gear</h3>
              <p className="text-xs text-stone-500 font-mono">Tested kitchen tools for safe preparation.</p>
            </div>
          </div>

          {/* 5 Clean Product Rows with Vector Badges */}
          <div className="divide-y divide-stone-100">
            {ESSENTIAL_GEAR.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Sleek Rounded-xl Vector Icon Badge */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Title + Verification Tag + Price */}
                    <div className="min-w-0">
                      {item.tag && (
                        <span className={`inline-block px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold tracking-wider mb-0.5 ${item.badgeBg}`}>
                          {item.tag}
                        </span>
                      )}
                      <h4 className="text-xs sm:text-sm font-bold text-[#111111] truncate">{item.name}</h4>
                      <div className="text-xs font-mono font-bold text-[#EA580C] mt-0.5">{item.price}</div>
                    </div>
                  </div>

                  {/* Affiliate Pill Link Button */}
                  <a
                    href={item.link}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-stone-50 hover:bg-stone-100 border border-stone-200/90 text-xs font-semibold text-stone-700 hover:text-stone-900 transition shrink-0 shadow-2xs"
                  >
                    <span>{item.store}</span>
                  </a>
                </div>
              );
            })}
          </div>

          {/* Footer disclosure */}
          <div className="pt-4 border-t border-stone-100 text-[11px] text-stone-400 font-mono text-center">
            Backed by USDA food safety guidelines. Purchases support free calculators.
          </div>
        </div>
      </div>
    </section>
  );
}
