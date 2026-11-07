'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { ThawCalculationResult, calculateCountdown, getMethodVerdict } from '@/lib/thaw';

interface VerdictCardProps {
  calculation: ThawCalculationResult | null;
  method: 'refrigerator' | 'cold-water';
  weightError?: string | null;
  cookingTimeError?: string | null;
}

function formatResultDate(date: Date): { dateStr: string; timeStr: string } {
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
  const day = date.getDate();
  const rawHours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = rawHours >= 12 ? 'PM' : 'AM';
  const displayHours = rawHours % 12 || 12;

  return {
    dateStr: `${weekday}, ${month} ${day}`,
    timeStr: `${displayHours}:${minutes} ${period}`,
  };
}

export const VerdictCard: React.FC<VerdictCardProps> = ({
  calculation,
  method,
  weightError,
  cookingTimeError,
}) => {
  const [mounted, setMounted] = useState(false);
  const [countdownText, setCountdownText] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const verdict = calculation ? getMethodVerdict(method, calculation) : null;

  useEffect(() => {
    if (!mounted || !verdict) return;

    const updateCountdown = () => {
      const res = calculateCountdown(verdict.startTime);
      if (res.isPast) {
        setCountdownText('Active now — start thawing immediately');
      } else {
        setCountdownText(`${res.text} remaining`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [mounted, verdict]);

  const handleCopy = () => {
    if (!verdict) return;
    const { dateStr, timeStr } = formatResultDate(verdict.startTime);
    const text = `Turkey Thaw Schedule (${method === 'refrigerator' ? 'Refrigerator' : 'Cold Water Bath'}):\n` +
      `• Target Bird: ${calculation?.weightInLb} lbs\n` +
      `• Start Thawing: ${dateStr} at ${timeStr}\n` +
      `• Required Duration: ${verdict.durationText}\n` +
      `• Feast Time: ${calculation?.cookingStartTime.toLocaleString('en-US')}\n` +
      `Empirical USDA Conduction Schedule · https://turkeythawclock.pages.dev`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const { dateStr, timeStr } = verdict
    ? formatResultDate(verdict.startTime)
    : { dateStr: '', timeStr: '' };

  return (
    <section
      aria-live="polite"
      aria-labelledby="result-heading"
      className="relative overflow-hidden rounded-2xl border border-white/[0.10] bg-[#151518] p-6 sm:p-7 shadow-[0_16px_48px_rgba(0,0,0,0.24)]
                 before:pointer-events-none before:absolute before:-inset-24 before:-z-0
                 before:bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.10),transparent_58%)]"
    >
      {/* Input Error states */}
      {weightError ? (
        <div className="relative z-10 flex min-h-[200px] flex-col items-center justify-center text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500 mb-1">
            Input required
          </p>
          <h3 className="text-xl font-semibold text-zinc-50">Enter Turkey Weight</h3>
          <p className="mt-2 max-w-sm text-xs font-mono text-zinc-400">{weightError}</p>
        </div>
      ) : cookingTimeError ? (
        <div className="relative z-10 flex min-h-[200px] flex-col items-center justify-center text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500 mb-1">
            Date invalid
          </p>
          <h3 className="text-xl font-semibold text-zinc-50">Feast Date in Past</h3>
          <p className="mt-2 max-w-sm text-xs font-mono text-zinc-400">{cookingTimeError}</p>
        </div>
      ) : !calculation || !verdict ? (
        <div className="relative z-10 flex min-h-[200px] flex-col justify-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500 mb-1">
            USDA Benchmark Rule
          </p>
          <p className="text-2xl font-semibold tracking-tight text-zinc-50">
            A 15 lb turkey requires 80 hours (approx. 3.3 days) in a 40°F refrigerator.
          </p>
        </div>
      ) : (
        <div className="relative z-10 space-y-6">
          {/* Header Row: Eyebrow + Active Status Chip */}
          <div className="flex items-center justify-between gap-4">
            <p id="result-heading" className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
              {method === 'refrigerator' ? 'Target Refrigerator Thaw Date' : 'Target Cold Water Bath Date'}
            </p>

            {/* Status Chip */}
            {verdict.safetyStatus === 'safe' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.45)]" />
                Safe to cook
              </span>
            )}
            {verdict.safetyStatus === 'urgent' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.45)]" />
                Start thaw today
              </span>
            )}
            {verdict.safetyStatus === 'too_late' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-400/10 px-2.5 py-1 text-[11px] font-medium text-red-300">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.45)]" />
                Window elapsed
              </span>
            )}
          </div>

          {/* Core Payoff (Section 4.2): Large near-white date + JetBrains Mono tabular time */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <time className="text-4xl sm:text-5xl font-semibold leading-none tracking-[-0.045em] text-zinc-50">
                {dateStr}
              </time>
              <span className="font-mono text-xl sm:text-2xl tabular-nums text-zinc-400">
                {timeStr}
              </span>
            </div>
            <p className="font-mono text-sm tabular-nums text-zinc-400">
              {mounted && countdownText ? countdownText : 'Calculating remaining time...'}
            </p>
          </div>

          {/* Metrics Divider */}
          <div className="h-px bg-white/[0.08]" />

          {/* Supporting Metrics Strip */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-zinc-500 uppercase tracking-wider text-[10px] block">
                Required Duration
              </span>
              <span className="text-sm font-semibold text-zinc-200 mt-0.5 block tabular-nums">
                {verdict.durationText}
                {calculation.brineBufferHours > 0 && method === 'refrigerator' ? (
                  <span className="text-xs text-orange-400 font-normal ml-1">
                    (+{calculation.brineBufferHours}h brine)
                  </span>
                ) : null}
              </span>
            </div>
            <div className="border-l border-white/[0.08] pl-4">
              <span className="text-zinc-500 uppercase tracking-wider text-[10px] block">
                Method Conduction
              </span>
              <span className="text-sm font-semibold text-zinc-200 mt-0.5 block">
                {method === 'refrigerator' ? '40°F Refrigerator' : 'Cold Water (30m)'}
              </span>
            </div>
          </div>

          {/* Bottom Action: Method Note + Section 6.1 Primary CTA */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-white/[0.08]">
            <span className="text-xs text-zinc-500">
              Based on {method === 'refrigerator' ? 'refrigerator protocol' : 'cold water protocol'}
            </span>

            {/* Section 6.1 Primary CTA Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="group relative inline-flex h-11 items-center justify-center gap-2 rounded-xl
                         bg-[#F97316] px-5 text-sm font-semibold text-[#160A03]
                         shadow-[0_4px_16px_rgba(249,115,22,0.16)]
                         transition-[transform,background-color,box-shadow] duration-150 ease-out
                         before:pointer-events-none before:absolute before:inset-x-px before:top-px before:h-px
                         before:rounded-t-[11px] before:bg-white/25
                         hover:-translate-y-px hover:bg-[#FB923C]
                         hover:shadow-[0_8px_24px_rgba(249,115,22,0.24)]
                         active:translate-y-0 active:scale-[0.98]
                         active:shadow-[0_2px_8px_rgba(249,115,22,0.16)]
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FB923C]
                         focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0F]"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied to clipboard ✓</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy schedule</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
