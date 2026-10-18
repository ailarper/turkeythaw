'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Thermometer, ExternalLink, ShieldCheck, ChefHat } from 'lucide-react';
import { siteConfig } from '@/config/site';

export const AffiliateCard: React.FC = () => {
  const { thermapen, amazonLeaveInProbe, disclosure } = siteConfig.affiliates;
  const [imageError, setImageError] = useState(false);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6 transition-all hover:shadow-md">
      {/* Appetite-Appeal Visual Header strictly constrained to w-full h-44 with fallback */}
      <div className="mb-5">
        {imageError ? (
          <div className="flex w-full h-44 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 p-4 text-center border border-orange-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white shadow-xs">
              <ChefHat className="h-6 w-6" />
            </div>
            <span className="mt-2 text-sm font-bold text-stone-900">Holiday Feast Goal</span>
            <span className="text-xs text-orange-800 font-semibold">🌡️ 165°F USDA Safe Roast</span>
          </div>
        ) : (
          <div className="relative w-full h-44 overflow-hidden rounded-xl bg-stone-100 shadow-xs">
            <Image
              src="/turkey.jpg"
              alt="Golden brown roasted Thanksgiving turkey with cranberries and herbs fresh from the oven"
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className="w-full h-44 object-cover rounded-xl transition-transform duration-500 hover:scale-105"
              priority
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none rounded-xl" />

            {/* Sleek Dark Glassmorphic Pill Badge in bottom-left */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md border border-white/10 shadow-sm">
              <span>🌡️</span>
              <span>165°F USDA Safe Roast</span>
            </div>

            <div className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-bold text-stone-900 shadow-xs border border-stone-200/50">
              🍴 Holiday Feast Goal
            </div>
          </div>
        )}
      </div>

      {/* Header with safety callout */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
          <Thermometer className="h-5 w-5" strokeWidth={2} />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200/60">
            <ShieldCheck className="h-3.5 w-3.5" />
            USDA Safety Standard
          </div>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-stone-900 sm:text-xl">
            Don&apos;t guess when it&apos;s done. USDA safe internal temp is 165°F.
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Undercooked turkey poses severe food poisoning risks, while overcooked turkey turns dry and chalky. Test the thickest part of the breast and innermost thigh with an accurate probe.
          </p>
        </div>
      </div>

      {/* Two recommended probes grid */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Thermapen ONE */}
        <a
          href={thermapen.url}
          target="_blank"
          rel={thermapen.rel}
          className="group flex flex-col justify-between rounded-xl border border-stone-200 bg-stone-50/60 p-4 transition-all hover:border-orange-500 hover:bg-orange-50/30 hover:shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">
                {thermapen.badge}
              </span>
              <span className="text-xs font-semibold text-stone-500">{thermapen.priceHint}</span>
            </div>
            <h3 className="mt-2 text-base font-bold text-stone-900 group-hover:text-orange-700">
              {thermapen.name}
            </h3>
            <p className="mt-1 text-xs text-stone-600 leading-relaxed">
              {thermapen.description}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-stone-200/80 pt-3 text-sm font-semibold text-orange-700">
            <span>View Thermapen ONE</span>
            <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </a>

        {/* Amazon Leave-In Probe */}
        <a
          href={amazonLeaveInProbe.url}
          target="_blank"
          rel={amazonLeaveInProbe.rel}
          className="group flex flex-col justify-between rounded-xl border border-stone-200 bg-stone-50/60 p-4 transition-all hover:border-orange-500 hover:bg-orange-50/30 hover:shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-stone-200/70 px-2 py-0.5 text-xs font-semibold text-stone-800">
                {amazonLeaveInProbe.badge}
              </span>
              <span className="text-xs font-semibold text-stone-500">{amazonLeaveInProbe.priceHint}</span>
            </div>
            <h3 className="mt-2 text-base font-bold text-stone-900 group-hover:text-orange-700">
              {amazonLeaveInProbe.name}
            </h3>
            <p className="mt-1 text-xs text-stone-600 leading-relaxed">
              {amazonLeaveInProbe.description}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-stone-200/80 pt-3 text-sm font-semibold text-orange-700">
            <span>View on Amazon</span>
            <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </a>
      </div>

      {/* Affiliate disclosure */}
      <p className="mt-4 text-[11px] leading-relaxed text-stone-600">
        <span className="font-medium text-stone-700">Affiliate Disclosure:</span> {disclosure}
      </p>
    </div>
  );
};
