'use client';

import React from 'react';
import { Calendar, Sparkles, ChefHat } from 'lucide-react';
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
  error?: string | null;
}

export const QuickSchedulePills: React.FC<QuickSchedulePillsProps> = ({
  cookingStartTime,
  onCookingStartTimeChange,
  brineEnabled,
  brineHours,
  onBrineEnabledChange,
  onBrineHoursChange,
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
    <div className="w-full rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6">
      {/* Cooking Start Time Label */}
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor="cooking-start-time-input"
          className="flex items-center gap-2 text-base font-bold text-stone-900 sm:text-lg"
        >
          <Calendar className="h-5 w-5 text-orange-600" />
          <span>Turkey goes in the oven at</span>
        </label>
      </div>

      {/* Quick Holiday Preset Pills */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCookingStartTimeChange(nextThanksgiving)}
          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all sm:text-sm ${
            isThanksgivingSelected
              ? 'bg-orange-500 text-white shadow-xs hover:bg-orange-600'
              : 'border border-stone-200 bg-stone-50 text-stone-700 hover:border-orange-300 hover:bg-orange-50/50'
          }`}
        >
          🦃 Thanksgiving Day ({nextThanksgiving.getFullYear()})
        </button>

        <button
          type="button"
          onClick={() => onCookingStartTimeChange(nextChristmas)}
          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all sm:text-sm ${
            isChristmasSelected
              ? 'bg-orange-500 text-white shadow-xs hover:bg-orange-600'
              : 'border border-stone-200 bg-stone-50 text-stone-700 hover:border-orange-300 hover:bg-orange-50/50'
          }`}
        >
          🎄 Christmas Day ({nextChristmas.getFullYear()})
        </button>
      </div>

      {/* Native Datetime Local Picker */}
      <div className="mt-4">
        <label
          htmlFor="cooking-start-time-input"
          className="block text-xs font-semibold uppercase tracking-wider text-stone-600"
        >
          Custom Date &amp; Dinner Time
        </label>
        <div className="mt-1.5 relative">
          <input
            id="cooking-start-time-input"
            type="datetime-local"
            value={formattedDateTimeLocal}
            onChange={handleCustomDateChange}
            className={`w-full rounded-xl border px-4 py-3 text-base font-bold text-stone-900 outline-none transition-all focus:ring-2 ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                : 'border-stone-300 focus:border-orange-500 focus:ring-orange-100'
            }`}
          />
        </div>
        {error ? <p className="mt-2 text-xs font-semibold text-red-600">{error}</p> : null}
      </div>

      {/* Brine Buffer Checkbox & Options */}
      <div className="mt-5 border-t border-stone-100 pt-4">
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
            className="mt-1 h-5 w-5 rounded-md border-stone-300 text-orange-600 accent-orange-600 focus:ring-orange-500"
          />
          <div className="flex-1">
            <span className="flex items-center gap-1.5 text-sm font-bold text-stone-900">
              <ChefHat className="h-4 w-4 text-orange-600" />
              Add Dry-Brine / Seasoning Buffer in Fridge
            </span>
            <p className="mt-0.5 text-xs text-stone-600">
              Salting the bird 12–24 hours before roasting yields crispier skin and juicier meat.
            </p>
          </div>
        </label>

        {/* Revealed Brine Pills (12h or 24h) */}
        {brineEnabled ? (
          <div className="mt-3 ml-8 flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-600">Buffer time:</span>
            <button
              type="button"
              onClick={() => onBrineHoursChange(12)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                brineHours === 12
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'border border-stone-200 bg-stone-50 text-stone-700 hover:border-orange-300'
              }`}
            >
              +12 Hours (Overnight Brine)
            </button>
            <button
              type="button"
              onClick={() => onBrineHoursChange(24)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                brineHours === 24
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'border border-stone-200 bg-stone-50 text-stone-700 hover:border-orange-300'
              }`}
            >
              +24 Hours (Full Day Brine)
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
