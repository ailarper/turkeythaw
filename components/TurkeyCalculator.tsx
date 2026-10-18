'use client';

import React, { useState, useMemo } from 'react';
import { WeightSelector, WeightUnit } from '@/components/WeightSelector';
import { QuickSchedulePills } from '@/components/QuickSchedulePills';
import { VerdictCard } from '@/components/VerdictCard';
import { RescueCard } from '@/components/RescueCard';
import { AffiliateCard } from '@/components/AffiliateCard';
import { AdPlaceholder } from '@/components/AdPlaceholder';
import { calculateThaw, getNextThanksgiving, ThawCalculationResult } from '@/lib/thaw';

export const TurkeyCalculator: React.FC = () => {
  // State initialization: defaults to 15 lb and next Thanksgiving at 12:00 PM local
  const [weightInLb, setWeightInLb] = useState<number>(15);
  const [unit, setUnit] = useState<WeightUnit>('lb');
  const [cookingStartTime, setCookingStartTime] = useState<Date>(() => getNextThanksgiving());
  const [brineEnabled, setBrineEnabled] = useState<boolean>(false);
  const [brineHours, setBrineHours] = useState<number>(12);

  // Validation
  const weightError = useMemo(() => {
    if (weightInLb === 0) return 'Please enter your turkey weight.';
    if (weightInLb < 1 || weightInLb > 50) {
      return 'Weight must be between 1 and 50 lb (0.5 to 23 kg).';
    }
    return null;
  }, [weightInLb]);

  const cookingTimeError = useMemo(() => {
    const now = new Date();
    if (cookingStartTime.getTime() < now.getTime()) {
      return 'Selected cooking time has already passed. Please choose an upcoming date.';
    }
    return null;
  }, [cookingStartTime]);

  // Reactive calculation on every input change
  const calculation: ThawCalculationResult | null = useMemo(() => {
    if (weightError || cookingTimeError) return null;

    return calculateThaw({
      weightInLb,
      cookingStartTime,
      brineBufferHours: brineEnabled ? brineHours : 0,
      now: new Date(),
    });
  }, [weightInLb, cookingStartTime, brineEnabled, brineHours, weightError, cookingTimeError]);

  return (
    <div className="w-full space-y-8">
      {/* Above-the-fold Interactive Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Co-located Instant Controls */}
        <div className="space-y-6 lg:col-span-6">
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
            error={cookingTimeError}
          />
        </div>

        {/* Right Column: Primary Verdict & Rescue Cards */}
        <div className="space-y-6 lg:col-span-6 lg:sticky lg:top-6">
          {/* Primary 3-Tier Verdict */}
          <VerdictCard
            calculation={calculation}
            weightError={weightError}
            cookingTimeError={cookingTimeError}
          />

          {/* Emergency Rescue Card: prominently displayed if fridge start is in the past */}
          {calculation && calculation.isFridgeStartInPast ? (
            <RescueCard calculation={calculation} />
          ) : null}

          {/* Contextual Affiliate Card placed directly under verdict */}
          <AffiliateCard />
        </div>
      </div>

      {/* CLS-Safe Ad Slot 1 (300x250 Medium Rectangle / In-Content) */}
      <div className="pt-2">
        <AdPlaceholder variant="rectangle" />
      </div>
    </div>
  );
};
