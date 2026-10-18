'use client';

import React from 'react';
import { Scale } from 'lucide-react';
import { LB_PER_KG } from '@/lib/thaw';

export type WeightUnit = 'lb' | 'kg';

interface WeightSelectorProps {
  weightInLb: number;
  unit: WeightUnit;
  onWeightChange: (lb: number) => void;
  onUnitChange: (unit: WeightUnit) => void;
  error?: string | null;
}

const COMMON_WEIGHT_PILLS_LB = [10, 12, 15, 18, 20, 24];

export const WeightSelector: React.FC<WeightSelectorProps> = ({
  weightInLb,
  unit,
  onWeightChange,
  onUnitChange,
  error,
}) => {
  // Convert current weight to displayed value based on active unit
  const displayValue =
    unit === 'lb'
      ? Math.round(weightInLb * 10) / 10
      : Math.round((weightInLb / LB_PER_KG) * 10) / 10;

  // Slider is clamped between 4 and 30 lb
  const clampedSliderValue = Math.min(30, Math.max(4, weightInLb || 15));

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (rawValue === '') {
      onWeightChange(0);
      return;
    }
    const parsed = parseFloat(rawValue);
    if (isNaN(parsed)) {
      onWeightChange(0);
      return;
    }

    if (unit === 'lb') {
      onWeightChange(parsed);
    } else {
      onWeightChange(parsed * LB_PER_KG);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valInLb = parseFloat(e.target.value);
    onWeightChange(valInLb);
  };

  const handlePillClick = (lbValue: number) => {
    onWeightChange(lbValue);
  };

  return (
    <div className="w-full rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6">
      {/* Title + Unit Toggle */}
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="turkey-weight-input" className="flex items-center gap-2 text-base font-bold text-stone-900 sm:text-lg">
          <Scale className="h-5 w-5 text-orange-600" />
          <span>Turkey Weight</span>
        </label>

        {/* lb / kg segmented pill toggle */}
        <div
          role="radiogroup"
          aria-label="Weight measurement unit"
          className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200/80"
        >
          <button
            type="button"
            role="radio"
            aria-checked={unit === 'lb'}
            onClick={() => onUnitChange('lb')}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              unit === 'lb'
                ? 'bg-white text-orange-700 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Pounds (lb)
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={unit === 'kg'}
            onClick={() => onUnitChange('kg')}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              unit === 'kg'
                ? 'bg-white text-orange-700 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Kilograms (kg)
          </button>
        </div>
      </div>

      {/* Number input and Quick Pills */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Direct number input */}
        <div className="relative flex-1">
          <input
            id="turkey-weight-input"
            type="number"
            min={unit === 'lb' ? 1 : 0.5}
            max={unit === 'lb' ? 50 : 23}
            step={unit === 'lb' ? 0.5 : 0.1}
            value={weightInLb > 0 ? displayValue : ''}
            placeholder={unit === 'lb' ? 'e.g. 15' : 'e.g. 6.8'}
            onChange={handleNumberInputChange}
            aria-describedby={error ? 'weight-error-hint' : undefined}
            className={`w-full rounded-xl border px-4 py-3 text-lg font-bold text-stone-900 outline-none transition-all placeholder:font-normal placeholder:text-stone-400 focus:ring-2 ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                : 'border-stone-300 focus:border-orange-500 focus:ring-orange-100'
            }`}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-stone-500">
            {unit}
          </span>
        </div>
      </div>

      {/* Inline error hint if invalid */}
      {error ? (
        <p id="weight-error-hint" className="mt-2 text-xs font-semibold text-red-600">
          {error}
        </p>
      ) : null}

      {/* Common Weight Pills */}
      <div className="mt-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
          Popular Sizes
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {COMMON_WEIGHT_PILLS_LB.map((pillLb) => {
            const pillKg = Math.round((pillLb / LB_PER_KG) * 2) / 2;
            const label = unit === 'lb' ? `${pillLb} lb` : `${pillKg} kg`;
            const isSelected = Math.abs(weightInLb - pillLb) < 0.25;

            return (
              <button
                key={pillLb}
                type="button"
                onClick={() => handlePillClick(pillLb)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all sm:text-sm ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-xs hover:bg-orange-600'
                    : 'border border-stone-200 bg-stone-50 text-stone-700 hover:border-orange-300 hover:bg-orange-50/50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Range Slider (4 - 30 lb) */}
      <div className="mt-5 space-y-2 border-t border-stone-100 pt-4">
        <div className="flex items-center justify-between text-xs text-stone-600">
          <span>Slider adjustment (4 - 30 lb)</span>
          <span className="font-semibold text-stone-800">
            {Math.round(weightInLb * 10) / 10} lb ({Math.round((weightInLb / LB_PER_KG) * 10) / 10} kg)
          </span>
        </div>
        <input
          id="turkey-weight-slider"
          aria-label="Adjust turkey weight slider between 4 and 30 pounds"
          type="range"
          min={4}
          max={30}
          step={0.5}
          value={clampedSliderValue}
          onChange={handleSliderChange}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-stone-200 accent-orange-600 outline-none"
        />
        <div className="flex justify-between text-[11px] text-stone-600">
          <span>4 lb (Small breast)</span>
          <span>15 lb (Average)</span>
          <span>30 lb (Huge feast)</span>
        </div>
      </div>
    </div>
  );
};
