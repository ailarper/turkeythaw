'use client';

import React from 'react';
import { ThawCalculationResult } from '@/lib/thaw';

interface RescueCardProps {
  calculation: ThawCalculationResult;
  onSwitchToColdWater?: () => void;
}

export const RescueCard: React.FC<RescueCardProps> = ({
  calculation,
  onSwitchToColdWater,
}) => {
  const {
    isTooLateForColdWater,
    coldWaterThawHours,
    formattedColdWaterStartTime,
    formattedColdWaterDuration,
    weightInLb,
  } = calculation;

  return (
    <div
      role="region"
      aria-label="Emergency Turkey Thawing Rescue Guide"
      className="w-full rounded-2xl border border-amber-500/20 bg-[#151518] p-6 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.24)]"
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs">
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-amber-400">
          Rescue Protocol
        </span>
        <span className="text-zinc-500 font-mono text-[11px]">USDA Contingency</span>
      </div>

      <h3 className="mt-4 text-lg sm:text-xl font-semibold tracking-tight text-zinc-50">
        {isTooLateForColdWater
          ? 'Window Elapsed: Roast 100% Frozen'
          : 'Switch to Cold-Water Rapid Submersion'}
      </h3>

      {!isTooLateForColdWater ? (
        <div className="mt-4 space-y-4">
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            The standard refrigerator window has elapsed. You can safely defrost in a cold water bath at a rate of 30 minutes per pound.
          </p>

          <div className="grid grid-cols-2 gap-4 rounded-xl border border-white/[0.08] bg-black/40 p-4 font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase text-zinc-500 font-semibold block">
                Latest Submerge Time
              </span>
              <span className="text-zinc-100 font-semibold tabular-nums mt-1 block text-sm">
                {formattedColdWaterStartTime}
              </span>
            </div>
            <div className="border-l border-white/[0.08] pl-4">
              <span className="text-[10px] uppercase text-zinc-500 font-semibold block">
                Total Bath Duration
              </span>
              <span className="text-zinc-100 font-semibold tabular-nums mt-1 block text-sm">
                {formattedColdWaterDuration} ({coldWaterThawHours}h)
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-zinc-400 font-mono">
            <div className="flex gap-2">
              <span className="text-orange-400 font-bold">01.</span>
              <span>Keep sealed in leak-proof wrap or heavy zip bag.</span>
            </div>
            <div className="flex gap-2">
              <span className="text-orange-400 font-bold">02.</span>
              <span>Rotate tap water completely every 30 minutes to maintain sub-40°F.</span>
            </div>
            <div className="flex gap-2">
              <span className="text-orange-400 font-bold">03.</span>
              <span>Cook immediately once thawed; never refreeze.</span>
            </div>
          </div>

          {onSwitchToColdWater && (
            <button
              type="button"
              onClick={onSwitchToColdWater}
              className="mt-2 w-full rounded-xl border border-orange-500/30 bg-orange-500/10 py-2.5 px-4 text-xs text-orange-300 hover:bg-orange-600 hover:text-white transition-colors font-medium shadow-sm"
            >
              Switch Calculator View to Cold Water Method →
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-4 text-xs text-zinc-400 leading-relaxed font-mono">
          <p>
            Do not panic. USDA FSIS guidelines confirm it is completely safe to roast a solid-frozen turkey directly in your oven:
          </p>

          <div className="space-y-2.5 border-l border-white/10 pl-3 py-1">
            <div>
              <strong className="text-zinc-200">1. Add 50% extra oven time:</strong>
              <span className="text-zinc-400 block mt-0.5">
                A thawed {weightInLb} lb bird takes ~{Math.round(weightInLb * 0.25 * 10) / 10}h at 325°F; frozen it takes ~{Math.round(weightInLb * 0.25 * 1.5 * 10) / 10}h.
              </span>
            </div>
            <div>
              <strong className="text-zinc-200">2. Extract the giblet bag at hour 2:</strong>
              <span className="text-zinc-400 block mt-0.5">
                Do not pry while frozen. After 90–120 mins the cavity loosens safely.
              </span>
            </div>
            <div>
              <strong className="text-zinc-200">3. Verify 165°F in thigh &amp; breast:</strong>
              <span className="text-zinc-400 block mt-0.5">
                Use a digital probe to guarantee full bacterial eradication before carving.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
