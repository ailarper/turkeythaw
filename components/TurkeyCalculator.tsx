'use client';

import React, { useState, useMemo } from 'react';
import { WeightSelector, WeightUnit } from '@/components/WeightSelector';
import { QuickSchedulePills } from '@/components/QuickSchedulePills';
import { VerdictCard } from '@/components/VerdictCard';
import { RescueCard } from '@/components/RescueCard';
import { calculateThaw, getNextThanksgiving, ThawCalculationResult } from '@/lib/thaw';

export const TurkeyCalculator: React.FC = () => {
  const [method, setMethod] = useState<'refrigerator' | 'cold-water'>('refrigerator');
  const [weightInLb, setWeightInLb] = useState<number>(15);
  const [unit, setUnit] = useState<WeightUnit>('lb');
  const [cookingStartTime, setCookingStartTime] = useState<Date>(() => getNextThanksgiving());
  const [brineEnabled, setBrineEnabled] = useState<boolean>(false);
  const [brineHours, setBrineHours] = useState<number>(12);

  const weightError = useMemo(() => {
    if (weightInLb === 0) return 'Please enter your turkey weight.';
    if (weightInLb < 4 || weightInLb > 30) {
      return 'Weight must be between 4 and 30 lb (1.8 to 13.6 kg).';
    }
    return null;
  }, [weightInLb]);

  const cookingTimeError = useMemo(() => {
    const now = new Date();
    if (cookingStartTime.getTime() < now.getTime()) {
      return 'Selected feast time has already passed. Please choose an upcoming date.';
    }
    return null;
  }, [cookingStartTime]);

  const calculation: ThawCalculationResult | null = useMemo(() => {
    if (weightError || cookingTimeError) return null;

    return calculateThaw({
      weightInLb,
      cookingStartTime,
      brineBufferHours: brineEnabled && method === 'refrigerator' ? brineHours : 0,
      now: new Date(),
    });
  }, [weightInLb, cookingStartTime, brineEnabled, brineHours, method, weightError, cookingTimeError]);

  return (
    <div id="calculator" className="w-full max-w-full md:max-w-[680px] mx-auto space-y-6">
      {/* Method Switcher: Section 6.3 Segmented Pill Control (h-10, rounded-xl, bg-white/[0.04]) */}
      <div className="flex justify-start">
        <div
          role="tablist"
          aria-label="Thaw Calculation Method"
          className="inline-flex h-10 w-full sm:w-auto rounded-xl border border-white/[0.08] bg-white/[0.04] p-1 gap-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={method === 'refrigerator'}
            onClick={() => setMethod('refrigerator')}
            className={`relative min-h-8 flex-1 sm:flex-initial rounded-lg px-4 text-[13px] font-medium transition-colors duration-150 text-center ${
              method === 'refrigerator'
                ? 'bg-[#2A2A30] text-zinc-50 shadow-[0_1px_2px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)]'
                : 'text-zinc-500 hover:text-zinc-200'
            }`}
          >
            <span className="relative z-10">Refrigerator (40°F Safe)</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={method === 'cold-water'}
            onClick={() => setMethod('cold-water')}
            className={`relative min-h-8 flex-1 sm:flex-initial rounded-lg px-4 text-[13px] font-medium transition-colors duration-150 text-center ${
              method === 'cold-water'
                ? 'bg-[#2A2A30] text-zinc-50 shadow-[0_1px_2px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)]'
                : 'text-zinc-500 hover:text-zinc-200'
            }`}
          >
            <span className="relative z-10">Cold Water Bath (30m Rotations)</span>
          </button>
        </div>
      </div>

      {/* Primary Input Surface: Surface-1 (#101014), single container (Section 2.1 & 5.2) */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#101014] p-6 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.20)]">
        <WeightSelector
          weightInLb={weightInLb}
          unit={unit}
          onWeightChange={setWeightInLb}
          onUnitChange={setUnit}
          error={weightError}
        />

        <QuickSchedulePills
          cookingStartTime={cookingStartTime}
          onCookingStartTimeChange={setCookingStartTime}
          brineEnabled={brineEnabled}
          brineHours={brineHours}
          onBrineEnabledChange={setBrineEnabled}
          onBrineHoursChange={setBrineHours}
          showBrineOption={method === 'refrigerator'}
          error={cookingTimeError}
        />
      </div>

      {/* Primary Result Card (Surface-2 #151518, Section 4.2 & 8) */}
      <VerdictCard
        calculation={calculation}
        method={method}
        weightError={weightError}
        cookingTimeError={cookingTimeError}
      />

      {/* Contextual Rescue Card (if fridge start in past or cold water selected) */}
      {calculation && (calculation.isFridgeStartInPast || method === 'cold-water') ? (
        <RescueCard
          calculation={calculation}
          onSwitchToColdWater={
            method === 'refrigerator' ? () => setMethod('cold-water') : undefined
          }
        />
      ) : null}

      {/* Supporting Methodology Note (Section 2.1 & 41) */}
      <aside className="rounded-xl border border-white/[0.06] bg-[#101014]/60 p-4 text-xs font-mono text-zinc-500 leading-relaxed">
        <span className="text-zinc-400 font-semibold block mb-1">
          // USDA FSIS METHODOLOGY STANDARD:
        </span>
        Refrigerator thawing requires 24 hours per 4.5–5.0 lbs at 40°F (4°C) or colder. Cold water bath requires 30 minutes per lb with mandatory 30-minute water rotations.
      </aside>
    </div>
  );
};
