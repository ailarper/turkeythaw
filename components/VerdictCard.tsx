'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles, ShieldCheck, Timer } from 'lucide-react';
import { ThawCalculationResult, calculateCountdown } from '@/lib/thaw';

interface VerdictCardProps {
  calculation: ThawCalculationResult | null;
  weightError?: string | null;
  cookingTimeError?: string | null;
}

export const VerdictCard: React.FC<VerdictCardProps> = ({
  calculation,
  weightError,
  cookingTimeError,
}) => {
  const [mounted, setMounted] = useState(false);
  const [countdownText, setCountdownText] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !calculation) return;

    const updateCountdown = () => {
      const res = calculateCountdown(calculation.fridgeStartTime);
      if (res.isPast) {
        setCountdownText('Started / Thaw Window Active');
      } else {
        setCountdownText(res.text);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [mounted, calculation]);

  // Minimum height reserved to guarantee zero CLS
  return (
    <div
      aria-live="polite"
      className="relative w-full min-h-[250px] overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-md transition-all sm:p-8"
    >
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-100/50 blur-3xl" />

      {/* When input has an error or is empty */}
      {weightError ? (
        <div className="flex h-full min-h-[190px] flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-lg font-bold text-stone-900">Enter a Turkey Weight</h3>
          <p className="mt-1 max-w-sm text-sm text-stone-600">{weightError}</p>
        </div>
      ) : cookingTimeError ? (
        <div className="flex h-full min-h-[190px] flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-lg font-bold text-stone-900">Cooking Date Issue</h3>
          <p className="mt-1 max-w-sm text-sm text-stone-600">{cookingTimeError}</p>
        </div>
      ) : !calculation ? (
        /* Fallback for server-rendered HTML or unmounted state: Timezone-neutral USDA fact for SEO crawlers */
        <div className="flex h-full min-h-[190px] flex-col justify-center">
          <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-800 border border-orange-200/60">
            <Sparkles className="h-3.5 w-3.5 text-orange-600" />
            USDA Refrigerator Calculation Rule
          </div>
          <p className="mt-3 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
            A 15 lb turkey needs 80 hours (approx. 3.3 days) in the refrigerator.
          </p>
          <p className="mt-2 text-sm text-stone-600">
            Safe thawing temperature: 40°F (4°C) or colder. Calculate your exact moving hour above.
          </p>
        </div>
      ) : (
        /* Dynamic calculated verdict */
        <div className="flex flex-col justify-between space-y-6">
          {/* Badge & Status */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-800 border border-orange-200/60">
              <Sparkles className="h-3.5 w-3.5 text-orange-600" />
              Optimal Freezer-to-Fridge Window
            </div>

            {calculation.isFridgeStartInPast ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                Window has passed
              </span>
            ) : mounted && countdownText ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-700">
                <Timer className="h-3.5 w-3.5 text-stone-600" />
                Starts in: <strong className="text-stone-900">{countdownText}</strong>
              </span>
            ) : null}
          </div>

          {/* Tier 1: Primary Huge Bold Verdict */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-orange-800">
              Step 1 • Move from freezer to fridge
            </span>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-stone-950 sm:text-3xl md:text-4xl">
              Put in the fridge:{' '}
              <span className="inline-block mt-1 rounded-xl bg-orange-500/10 px-2.5 py-1 text-orange-700 font-black">
                {calculation.formattedFridgeStartTime}
              </span>
            </h2>
          </div>

          {/* Tier 2: Weighted Secondary Metrics */}
          <div className="flex flex-wrap items-center gap-4 rounded-xl bg-stone-50 p-4 border border-stone-200/80">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-xs font-medium text-stone-600">Total Fridge Thaw Duration</div>
                <div className="text-sm font-bold text-stone-900 sm:text-base">
                  {calculation.formattedFridgeDuration} in fridge
                  {calculation.brineBufferHours > 0 ? (
                    <span className="ml-1 text-xs font-normal text-stone-600">
                      (includes +{calculation.brineBufferHours}h brine buffer)
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="hidden h-8 w-px bg-stone-200 sm:block" />

            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-stone-600" />
              <div>
                <div className="text-xs font-medium text-stone-600">Turkey Weight</div>
                <div className="text-sm font-bold text-stone-900 sm:text-base">
                  {calculation.weightInLb} lb ({Math.round((calculation.weightInLb / 2.20462) * 10) / 10} kg)
                </div>
              </div>
            </div>
          </div>

          {/* Tier 3: Dimmed USDA Notes */}
          <div className="flex items-start gap-2 text-xs text-stone-600 border-t border-stone-100 pt-3">
            <ShieldCheck className="h-4 w-4 shrink-0 text-stone-600 mt-0.5" />
            <p className="leading-relaxed">
              <strong>USDA Safety Guideline:</strong> Refrigerator thawing occurs safely below 40°F (4°C). Once thawed, your turkey safely keeps in the refrigerator for an additional 1 to 2 days before cooking.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
