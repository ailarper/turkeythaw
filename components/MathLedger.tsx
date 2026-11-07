'use client';

import React from 'react';
import { Reveal } from '@/components/Reveal';

const TIERS = [
  {
    weight: '10 to 12 lbs',
    fridge: '48 to 72 hrs',
    fridgeDays: '2 – 3 days',
    coldWater: '5 to 6 hrs',
  },
  {
    weight: '14 to 16 lbs',
    fridge: '72 to 96 hrs',
    fridgeDays: '3 – 4 days',
    coldWater: '7 to 8 hrs',
  },
  {
    weight: '18 to 20 lbs',
    fridge: '96 to 120 hrs',
    fridgeDays: '4 – 5 days',
    coldWater: '9 to 10 hrs',
  },
  {
    weight: '22 to 24 lbs',
    fridge: '120 to 144 hrs',
    fridgeDays: '5 – 6 days',
    coldWater: '11 to 12 hrs',
  },
  {
    weight: '26 to 30 lbs',
    fridge: '144 to 168 hrs',
    fridgeDays: '6 – 7 days',
    coldWater: '13 to 15 hrs',
  },
];

export const MathLedger: React.FC = () => {
  return (
    <section id="math" className="w-full mt-20">
      <Reveal delay={0}>
        <div className="mb-8">
          <div className="font-mono text-xs uppercase tracking-widest text-orange-400 mb-2">
            {'// 02: THE THAW MATH'}
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-white">
            Dual-Method Physics &amp; Timetable Matrix
          </h2>
          <p className="text-sm text-neutral-400 mt-2 max-w-2xl leading-relaxed">
            Strict empirical timelines calculated directly from USDA FSIS thermal conduction curves. Refrigerator thawing preserves cell walls; cold water transfers energy 25× faster than air.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Monospace Receipt / Terminal Box */}
        <div className="lg:col-span-5">
          <Reveal delay={0.06}>
            <div className="rounded-2xl border border-white/[0.08] bg-[#0F1219] p-6 font-mono text-xs shadow-sm">
              <div className="flex items-center justify-between text-neutral-500 pb-3 border-b border-white/[0.08]">
                <span className="text-orange-400">{'// TERMINAL RECEIPT'}</span>
                <span>SYS_FSIS_REF</span>
              </div>

              <div className="py-4 space-y-2 text-neutral-300">
                <div className="text-orange-300 font-semibold">
                  BENCHMARK CALCULATION: 15.0 LB BIRD
                </div>
                <div className="border-t border-dashed border-white/10 my-2" />

                <div className="flex justify-between py-1">
                  <span className="text-neutral-400">Target Weight:</span>
                  <span className="text-white font-semibold">15.00 lbs / 6.80 kg</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-400">Fridge Thaw (40°F):</span>
                  <span className="text-orange-400 font-semibold">80.00 hrs (3.33 days)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-400">Cold Water Rate:</span>
                  <span className="text-white font-semibold">0.50 hr / lb</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-400">Cold Water Thaw:</span>
                  <span className="text-orange-400 font-semibold">07.50 hrs total</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-400">Water Rotations:</span>
                  <span className="text-white font-semibold">15 cycles (every 30m)</span>
                </div>

                <div className="border-t border-dashed border-white/10 my-2" />

                <div className="flex justify-between py-1 text-neutral-500">
                  <span>Room Temp Counter:</span>
                  <span className="text-red-400">ILLEGAL / TOXIN RISK</span>
                </div>
                <div className="flex justify-between py-1 text-neutral-500">
                  <span>Direct Frozen Roast:</span>
                  <span className="text-neutral-300">SAFE (+50% OVEN TIME)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08] text-[10px] text-neutral-500 flex justify-between">
                <span>CHECKSUM: OK</span>
                <span className="text-emerald-400">STATUS: 100% CLIENT VERIFIED</span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right Column: Clean Horizontal Divider Matrix Rows */}
        <div className="lg:col-span-7 space-y-4">
          <Reveal delay={0.12}>
            <div className="rounded-2xl border border-white/[0.08] bg-[#0F1219] p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs font-mono uppercase tracking-wider text-neutral-500">
                <span>Turkey Weight Tier</span>
                <div className="flex gap-8 sm:gap-12 text-right">
                  <span className="w-24 sm:w-28 text-white">Fridge (40°F)</span>
                  <span className="w-20 sm:w-24 text-neutral-400">Cold Bath</span>
                </div>
              </div>

              <div className="divide-y divide-white/[0.06]">
                {TIERS.map((tier, idx) => (
                  <div
                    key={idx}
                    className="py-4 flex items-center justify-between text-xs sm:text-sm transition-colors hover:bg-white/[0.02] px-2 rounded-lg"
                  >
                    <div>
                      <div className="font-semibold text-white font-mono">
                        {tier.weight}
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        {tier.fridgeDays} in refrigerator
                      </div>
                    </div>

                    <div className="flex gap-8 sm:gap-12 text-right font-mono tabular-nums">
                      <span className="w-24 sm:w-28 font-medium text-white">
                        {tier.fridge}
                      </span>
                      <span className="w-20 sm:w-24 text-neutral-400">
                        {tier.coldWater}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-neutral-500">
                <span>Shelf life after full fridge thaw: 1 to 2 days safe</span>
                <span className="text-white">Early Thaw Safe</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
