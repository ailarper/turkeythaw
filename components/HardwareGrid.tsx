'use client';

import React from 'react';
import { Reveal } from '@/components/Reveal';
import { siteConfig } from '@/config/site';

const HARDWARE_ITEMS = [
  {
    num: '01',
    category: 'DIGITAL PROBE',
    name: 'ThermoWorks Thermapen ONE',
    price: 'Check price',
    tagline: '1-Second Full Reading · ±0.5°F Accuracy',
    description:
      'The definitive professional meat probe. Auto-rotating backlit display guarantees instant verification of the critical 165°F breast and thigh target before heat escapes the oven.',
    specs: ['1-Second Read Time', '±0.5°F Precision', 'NSF Certified'],
    imageUrl:
      'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80',
    url: siteConfig.affiliates.products[0].url,
    cta: 'View Thermapen ↗',
  },
  {
    num: '02',
    category: 'CARVING INSTRUMENT',
    name: 'Cutluxe 9" Carving Knife & Fork Set',
    price: 'Check price',
    tagline: 'German ThyssenKrupp Steel · 56+ Rockwell',
    description:
      'Precision-forged high-carbon steel with a hand-sharpened 14-16 degree edge. Slices clean, paper-thin breast medallions without shredding crispy skin.',
    specs: ['56+ Rockwell Hardness', 'Full Tang Pakkawood', 'Matching Fork'],
    imageUrl:
      'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=600&q=80',
    url: siteConfig.affiliates.products[1].url,
    cta: 'Amazon ↗',
  },
  {
    num: '03',
    category: 'ROASTING VESSEL',
    name: 'Cuisinart Tri-Ply Roasting Pan with V-Rack',
    price: 'Check price',
    tagline: 'Tri-Ply Stainless Clad · Holds up to 25 lbs',
    description:
      'Heavy gauge stainless steel exterior with aluminum core for even heat distribution. Nonstick V-rack elevates the bird for 360° convection browning and collecting pan drippings.',
    specs: ['Riveted Cast Handles', 'Nonstick V-Rack', 'Induction Ready'],
    imageUrl:
      'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?auto=format&fit=crop&w=600&q=80',
    url: siteConfig.affiliates.products[2].url,
    cta: 'Amazon ↗',
  },
  {
    num: '04',
    category: 'OVEN DECOUPLING',
    name: 'Oster 22-Quart Countertop Roaster Oven',
    price: 'Check price',
    tagline: 'Frees Main Kitchen Oven · Fits up to 26 lb Bird',
    description:
      'Dedicated standalone roasting environment with a self-basting lid that continually recirculates steam and turkey juices. Frees your primary oven for side dishes, pies, and casseroles.',
    specs: ['22-Quart Volume', '150°F to 450°F Dial', 'Self-Basting Lid'],
    imageUrl:
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
    url: siteConfig.affiliates.products[3].url,
    cta: 'Amazon ↗',
  },
];

export const HardwareGrid: React.FC = () => {
  return (
    <section id="hardware" className="w-full mt-20">
      <Reveal delay={0}>
        <div className="mb-10">
          <div className="font-mono text-xs uppercase tracking-widest text-orange-400 mb-2">
            {'// 04: HARDWARE ESSENTIALS'}
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-white">
            Tested Roasting Instruments
          </h2>
          <p className="text-sm text-neutral-400 mt-2 max-w-2xl leading-relaxed">
            Essential kitchen hardware that eliminates guesswork, verifies internal heat, and preserves moisture. Zero sponsored junk.
          </p>
        </div>
      </Reveal>

      {/* 2x2 Minimalist Grid with Curated Framed Headers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {HARDWARE_ITEMS.map((item, idx) => (
          <Reveal key={idx} delay={idx * 0.08} className="h-full">
            <div className="h-full flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0F1219] p-6 sm:p-7 transition-all hover:border-orange-500/30 group shadow-sm">
              <div>
                {/* Monospace Top Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 font-semibold">{item.num}</span>
                    <span className="text-neutral-600">/</span>
                    <span className="text-neutral-400 uppercase">{item.category}</span>
                  </div>
                  <span className="text-white font-semibold tabular-nums">{item.price}</span>
                </div>

                {/* Framed Curated Product Photo */}
                <div className="overflow-hidden rounded-xl border border-white/10 aspect-[16/10] my-4 bg-[#0B0D13]">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                {/* Title & Tagline */}
                <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-white group-hover:text-orange-200 transition-colors">
                  {item.name}
                </h3>
                <p className="font-mono text-xs text-orange-400/80 mt-1">
                  {item.tagline}
                </p>

                {/* Description */}
                <p className="text-xs sm:text-sm text-neutral-400 mt-3 leading-relaxed">
                  {item.description}
                </p>

                {/* Specs */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.specs.map((spec, sIdx) => (
                    <span
                      key={sIdx}
                      className="font-mono text-[10px] text-neutral-400 rounded-md border border-white/5 bg-white/[0.02] px-2 py-0.5"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className="font-mono text-[11px] text-neutral-500">
                  Direct Verified Merchant
                </span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 font-mono text-xs text-orange-300 hover:bg-orange-600 hover:text-white transition-all duration-150"
                >
                  {item.cta}
                </a>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Editorial Disclosure */}
      <Reveal delay={0.24}>
        <div className="mt-6 text-[11px] font-mono text-neutral-500 border-t border-white/[0.06] pt-4 leading-relaxed">
          {'// DISCLOSURE: We independently benchmark equipment. When you purchase through our links, we may receive an affiliate commission at no extra cost to you.'}
        </div>
      </Reveal>
    </section>
  );
};
