'use client';

import React from 'react';
import { Reveal } from '@/components/Reveal';

const STEPS = [
  {
    number: '01',
    title: 'Keep Sealed in Leak-Proof Plastic Wrap',
    protocol: 'Contamination & Osmosis Barrier',
    description:
      'Never allow raw poultry to contact direct bath water. Keep the original factory barrier intact or seal inside a heavy-duty, leak-proof food bag. This prevents water absorption which makes meat spongy and stops salmonella transfer to your sink.',
    badge: 'Step 1 · Packaging',
    imageUrl:
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Sealed cold storage and packaging barrier',
  },
  {
    number: '02',
    title: 'Rotate Cold Water Bath Every 30 Minutes',
    protocol: 'Sub-40°F Conduction Regulation',
    description:
      'Water conducts thermal energy 25× faster than air. Submerge breast-down in cold tap water and drain completely every 30 minutes, replacing with fresh cold tap water. This keeps the water temperature safely below 40°F (4°C) until thawed.',
    badge: 'Step 2 · Rapid Convection',
    imageUrl:
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Kitchen sink and rapid cold water bath prep station',
  },
  {
    number: '03',
    title: 'Zero Counter Thawing (The 40°F – 140°F Danger Zone)',
    protocol: 'Biological Hazard Prohibition',
    description:
      'Never thaw poultry on a kitchen counter, in a garage, or using warm water. Between 40°F and 140°F, bacterial colonies like Salmonella and Campylobacter double every 20 minutes, generating enterotoxins that cannot be neutralized by cooking heat.',
    badge: 'Step 3 · Biological Rule',
    imageUrl:
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Clean modern refrigerator interior with sub-40°F safe zone',
  },
  {
    number: '04',
    title: 'Target 165°F (74°C) Internal Temp in Breast & Thigh',
    protocol: 'Microbial Neutralization Standard',
    description:
      'Plastic pop-up buttons are notoriously inaccurate. Probe the innermost thigh joint, thickest part of the breast, and wing joint with a digital instant thermometer. Remove at 165°F and rest 20–30 minutes before carving to allow juice redistribution.',
    badge: 'Step 4 · Doneness Milestone',
    imageUrl:
      'https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Carving roasted golden turkey breast at 165°F',
  },
];

export const VerticalTimelineSafety: React.FC = () => {
  return (
    <section id="safety" className="w-full mt-20">
      <Reveal delay={0}>
        <div className="mb-10">
          <div className="font-mono text-xs uppercase tracking-widest text-orange-400 mb-2">
            {'// 03: USDA SAFETY PROTOCOLS'}
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-white">
            Chronological Safe Thawing Execution
          </h2>
          <p className="text-sm text-neutral-400 mt-2 max-w-2xl leading-relaxed">
            Follow this 4-phase sequence to prevent foodborne illness and guarantee peak succulence on carving day.
          </p>
        </div>
      </Reveal>

      {/* Vertical Spine Timeline */}
      <div className="relative pl-6 sm:pl-10 space-y-10 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-px before:bg-white/10">
        {STEPS.map((step, idx) => (
          <Reveal key={idx} delay={idx * 0.08}>
            <div className="relative group">
              {/* Monospace Node */}
              <div className="absolute -left-6 sm:-left-10 top-2 flex h-7 w-7 sm:h-8 sm:w-8 -translate-x-1/2 items-center justify-center rounded-full border border-white/20 bg-[#0B0D13] font-mono text-xs text-white group-hover:border-orange-500 group-hover:text-orange-400 group-hover:shadow-[0_0_12px_rgba(234,88,12,0.4)] transition-all">
                {step.number}
              </div>

              {/* Content Box with Framed Thumbnail */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0F1219] p-6 sm:p-7 transition-all hover:border-white/20 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                  {/* Left Column: Text & Guidance */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-orange-400">
                        {step.protocol}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 font-mono text-[10px] text-neutral-400">
                        {step.badge}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-white group-hover:text-orange-200 transition-colors">
                      {step.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Right Column: Framed Thumbnail with Hover Zoom */}
                  <div className="w-full sm:w-48 md:w-56 shrink-0 overflow-hidden rounded-xl border border-white/10 aspect-[16/10] bg-[#0B0D13]">
                    <img
                      src={step.imageUrl}
                      alt={step.imageAlt}
                      className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
