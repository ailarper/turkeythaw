'use client';

import React from 'react';

const STATS = [
  {
    value: '24 hrs',
    unit: '/ 4.5 lbs',
    caption: 'Refrigerator thaw rate at 40°F',
  },
  {
    value: '30 min',
    unit: '/ 1.0 lb',
    caption: 'Cold water bath (30m rotations)',
  },
  {
    value: '40°F',
    unit: 'Max Safe',
    caption: 'Upper limit of USDA safe cooling',
  },
  {
    value: '165°F',
    unit: 'Target',
    caption: 'Internal safe doneness in breast',
  },
];

export const HorizontalMetricsBar: React.FC = () => {
  return (
    <div className="w-full rounded-2xl border border-white/[0.08] bg-[#101014]/60 py-6 px-6 sm:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {STATS.map((stat, idx) => (
          <div
            key={idx}
            className={`flex flex-col justify-center ${
              idx > 0 ? 'md:border-l md:border-white/[0.08] md:pl-8' : ''
            }`}
          >
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl sm:text-3xl font-semibold text-zinc-50 tabular-nums tracking-tight">
                {stat.value}
              </span>
              <span className="font-mono text-xs text-orange-400 font-medium">
                {stat.unit}
              </span>
            </div>
            <p className="font-mono text-[11px] text-zinc-400 mt-1">
              {stat.caption}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
