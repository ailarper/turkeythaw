'use client';

import React, { useState, useEffect } from 'react';
import { LB_PER_KG } from '@/lib/thaw';

export type WeightUnit = 'lb' | 'kg';

interface WeightSelectorProps {
  weightInLb: number;
  unit: WeightUnit;
  onWeightChange: (lb: number) => void;
  onUnitChange: (unit: WeightUnit) => void;
  error?: string | null;
}

const PRESET_WEIGHTS_LB = [10, 12, 15, 20, 25] as const;

export const WeightSelector: React.FC<WeightSelectorProps> = ({
  weightInLb,
  unit,
  onWeightChange,
  onUnitChange,
  error,
}) => {
  const isPreset = PRESET_WEIGHTS_LB.some((preset) => Math.abs(preset - weightInLb) < 0.05);
  const [customMode, setCustomMode] = useState<boolean>(!isPreset);

  useEffect(() => {
    if (isPreset && !customMode) {
      // synced
    } else if (!isPreset) {
      setCustomMode(true);
    }
  }, [weightInLb, isPreset]);

  const displayValue =
    unit === 'lb'
      ? Math.round(weightInLb * 10) / 10
      : Math.round((weightInLb / LB_PER_KG) * 10) / 10;

  const clampedSliderValue = Math.min(30, Math.max(4, weightInLb || 15));

  const handleSelectPreset = (presetLb: number) => {
    setCustomMode(false);
    onWeightChange(presetLb);
  };

  const handleSelectCustom = () => {
    setCustomMode(true);
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomMode(true);
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
    setCustomMode(true);
    const valInLb = parseFloat(e.target.value);
    onWeightChange(valInLb);
  };

  return (
    <div className="space-y-4">
      {/* Label & Unit Toggle */}
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="turkey-weight-input"
          className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-400"
        >
          Target Bird Weight
        </label>

        {/* lb / kg segmented pill control */}
        <div
          role="radiogroup"
          aria-label="Weight measurement unit"
          className="inline-flex h-8 rounded-lg border border-white/[0.08] bg-white/[0.04] p-0.5"
        >
          <button
            type="button"
            role="radio"
            aria-checked={unit === 'lb'}
            onClick={() => onUnitChange('lb')}
            className={`min-h-[26px] rounded-md px-2.5 text-xs font-mono font-medium transition-colors ${
              unit === 'lb'
                ? 'bg-[#2A2A30] text-zinc-50 shadow-[0_1px_2px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)]'
                : 'text-zinc-500 hover:text-zinc-200'
            }`}
          >
            LB
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={unit === 'kg'}
            onClick={() => onUnitChange('kg')}
            className={`min-h-[26px] rounded-md px-2.5 text-xs font-mono font-medium transition-colors ${
              unit === 'kg'
                ? 'bg-[#2A2A30] text-zinc-50 shadow-[0_1px_2px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)]'
                : 'text-zinc-500 hover:text-zinc-200'
            }`}
          >
            KG
          </button>
        </div>
      </div>

      {/* Main Numerical Display & Input */}
      <div>
        <div className="relative flex items-baseline border-b border-white/[0.08] pb-2 focus-within:border-orange-500 transition-colors">
          <input
            id="turkey-weight-input"
            type="number"
            min={unit === 'lb' ? 4 : 1.8}
            max={unit === 'lb' ? 30 : 13.6}
            step={unit === 'lb' ? 0.5 : 0.2}
            value={weightInLb > 0 ? displayValue : ''}
            placeholder={unit === 'lb' ? '15.0' : '6.8'}
            onChange={handleNumberInputChange}
            aria-describedby={error ? 'weight-error-hint' : undefined}
            className="w-full bg-transparent text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums text-zinc-50 outline-none placeholder:text-zinc-700 font-mono"
          />
          <span className="font-mono text-sm text-zinc-400 uppercase tracking-widest pl-3 font-medium">
            {unit}
          </span>
        </div>

        {error ? (
          <p id="weight-error-hint" className="mt-2 text-xs font-mono text-red-400">
            {error}
          </p>
        ) : null}
      </div>

      {/* Unified Segmented Pill Control: h-10, rounded-xl, bg-white/[0.04], active bg-[#2A2A30] */}
      <div className="pt-1">
        <div
          role="toolbar"
          aria-label="Preset and custom weight selection"
          className="inline-flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] p-1 gap-1"
        >
          {PRESET_WEIGHTS_LB.map((presetLb) => {
            const isSelected = !customMode && Math.abs(weightInLb - presetLb) < 0.05;
            const label =
              unit === 'lb'
                ? `${presetLb} lb`
                : `${Math.round((presetLb / LB_PER_KG) * 10) / 10} kg`;

            return (
              <button
                key={presetLb}
                type="button"
                onClick={() => handleSelectPreset(presetLb)}
                className={`relative min-h-8 flex-1 rounded-lg px-2 sm:px-3 text-[13px] font-medium transition-colors duration-150 text-center ${
                  isSelected
                    ? 'bg-[#2A2A30] text-zinc-50 shadow-[0_1px_2px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)]'
                    : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}

          {/* Custom Pill */}
          <button
            type="button"
            onClick={handleSelectCustom}
            className={`relative min-h-8 flex-1 rounded-lg px-2 sm:px-3 text-[13px] font-medium transition-colors duration-150 text-center ${
              customMode
                ? 'bg-[#2A2A30] text-zinc-50 shadow-[0_1px_2px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)]'
                : 'text-zinc-500 hover:text-zinc-200'
            }`}
          >
            <span className="relative z-10">Custom</span>
          </button>
        </div>
      </div>

      {/* Range Slider for Continuous Fine-Tuning */}
      <div className="pt-2">
        <div className="flex items-center justify-between font-mono text-[11px] text-zinc-500 mb-2">
          <span>Continuous range</span>
          <span className="text-zinc-300 tabular-nums">
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
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-orange-500 outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        />
        <div className="flex justify-between font-mono text-[10px] text-zinc-600 mt-1.5 tabular-nums">
          <span>4 lb</span>
          <span>15 lb (avg)</span>
          <span>30 lb</span>
        </div>
      </div>
    </div>
  );
};
