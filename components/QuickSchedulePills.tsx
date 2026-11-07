'use client';

import React from 'react';
import {
  getNextThanksgiving,
  getNextChristmas,
  formatToDateTimeLocal,
  parseFromDateTimeLocal,
} from '@/lib/thaw';

interface QuickSchedulePillsProps {
  cookingStartTime: Date;
  onCookingStartTimeChange: (date: Date) => void;
  brineEnabled: boolean;
  brineHours: number;
  onBrineEnabledChange: (enabled: boolean) => void;
  onBrineHoursChange: (hours: number) => void;
  showBrineOption?: boolean;
  error?: string | null;
}

export const QuickSchedulePills: React.FC<QuickSchedulePillsProps> = ({
  cookingStartTime,
  onCookingStartTimeChange,
  brineEnabled,
  brineHours,
  onBrineEnabledChange,
  onBrineHoursChange,
  showBrineOption = true,
  error,
}) => {
  const nextThanksgiving = getNextThanksgiving();
  const nextChristmas = getNextChristmas();

  const formattedDateTimeLocal = formatToDateTimeLocal(cookingStartTime);

  const isThanksgivingSelected =
    cookingStartTime.getFullYear() === nextThanksgiving.getFullYear() &&
    cookingStartTime.getMonth() === nextThanksgiving.getMonth() &&
    cookingStartTime.getDate() === nextThanksgiving.getDate() &&
    cookingStartTime.getHours() === nextThanksgiving.getHours();

  const isChristmasSelected =
    cookingStartTime.getFullYear() === nextChristmas.getFullYear() &&
    cookingStartTime.getMonth() === nextChristmas.getMonth() &&
    cookingStartTime.getDate() === nextChristmas.getDate() &&
    cookingStartTime.getHours() === nextChristmas.getHours();

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFromDateTimeLocal(e.target.value);
    if (parsed) {
      onCookingStartTimeChange(parsed);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-white/[0.08]">
      {/* Label */}
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor="cooking-start-time-input"
          className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-400"
        >
          Target Feast Date &amp; Time
        </label>
        <span className="font-mono text-[11px] text-zinc-500">
          Oven Insertion
        </span>
      </div>

      {/* Preset Holiday Feasts: Unified Segmented Pill Control (h-10, rounded-xl, bg-white/[0.04]) */}
      <div
        role="toolbar"
        aria-label="Preset holiday feast dates"
        className="inline-flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] p-1 gap-1"
      >
        <button
          type="button"
          onClick={() => onCookingStartTimeChange(nextThanksgiving)}
          className={`relative min-h-8 flex-1 rounded-lg px-3 text-[13px] font-medium transition-colors duration-150 text-center ${
            isThanksgivingSelected
              ? 'bg-[#2A2A30] text-zinc-50 shadow-[0_1px_2px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)]'
              : 'text-zinc-500 hover:text-zinc-200'
          }`}
        >
          <span className="relative z-10">Thanksgiving ({nextThanksgiving.getFullYear()})</span>
        </button>

        <button
          type="button"
          onClick={() => onCookingStartTimeChange(nextChristmas)}
          className={`relative min-h-8 flex-1 rounded-lg px-3 text-[13px] font-medium transition-colors duration-150 text-center ${
            isChristmasSelected
              ? 'bg-[#2A2A30] text-zinc-50 shadow-[0_1px_2px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)]'
              : 'text-zinc-500 hover:text-zinc-200'
          }`}
        >
          <span className="relative z-10">Christmas ({nextChristmas.getFullYear()})</span>
        </button>
      </div>

      {/* Custom Date & Time Input */}
      <div>
        <div className="relative border-b border-white/[0.08] pb-2 focus-within:border-orange-500 transition-colors">
          <input
            id="cooking-start-time-input"
            type="datetime-local"
            value={formattedDateTimeLocal}
            onChange={handleCustomDateChange}
            className="w-full bg-transparent text-lg sm:text-xl font-mono text-zinc-100 outline-none"
          />
        </div>
        {error ? (
          <p className="mt-2 font-mono text-xs text-red-400">{error}</p>
        ) : null}
      </div>

      {/* Brine Buffer Option */}
      {showBrineOption ? (
        <div className="pt-2">
          <label className="flex cursor-pointer items-start gap-3 select-none">
            <input
              type="checkbox"
              id="brine-buffer-checkbox"
              checked={brineEnabled}
              onChange={(e) => {
                onBrineEnabledChange(e.target.checked);
                if (e.target.checked && brineHours === 0) {
                  onBrineHoursChange(12);
                }
              }}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-zinc-900 text-orange-600 accent-orange-500 focus:ring-0"
            />
            <div className="flex-1">
              <span className="text-xs font-medium text-zinc-300">
                Dry-Brine / Seasoning Lead Buffer
              </span>
              <p className="mt-0.5 text-xs text-zinc-500 leading-relaxed">
                Salting the bird 12–24h prior in the fridge draws out moisture for crispier roasted skin.
              </p>
            </div>
          </label>

          {brineEnabled ? (
            <div className="mt-3 ml-7 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onBrineHoursChange(12)}
                className={`h-8 rounded-lg px-3 text-xs font-mono transition-colors ${
                  brineHours === 12
                    ? 'bg-[#2A2A30] text-zinc-50 border border-white/10 shadow-sm'
                    : 'border border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                +12h Overnight
              </button>
              <button
                type="button"
                onClick={() => onBrineHoursChange(24)}
                className={`h-8 rounded-lg px-3 text-xs font-mono transition-colors ${
                  brineHours === 24
                    ? 'bg-[#2A2A30] text-zinc-50 border border-white/10 shadow-sm'
                    : 'border border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                +24h Full-Day
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
