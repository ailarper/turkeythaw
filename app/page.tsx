import React from 'react';
import { TurkeyCalculator } from '@/components/TurkeyCalculator';
import { FaqSection } from '@/components/FaqSection';
import { AdPlaceholder } from '@/components/AdPlaceholder';
import { siteConfig } from '@/config/site';
import { Clock, ShieldCheck, Flame } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      {/* Top Sticky Header */}
      <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white shadow-xs">
              <Clock className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-stone-900">
                TurkeyThaw<span className="text-orange-600">Clock</span>
              </span>
              <span className="hidden text-xs text-stone-600 sm:inline ml-2 border-l border-stone-200 pl-2">
                USDA Refrigerator &amp; Rescue Guide
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700 border border-stone-200/60">
            <ShieldCheck className="h-3.5 w-3.5 text-stone-600" />
            <span>100% Client-Side &bull; No Sign-Up</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 flex-1">
        {/* Hero Section & SEO Header */}
        <section className="mb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100/80 px-3 py-0.5 text-xs font-bold text-orange-800">
            <Flame className="h-3.5 w-3.5 text-orange-600" />
            Thanksgiving &amp; Holiday Dinner Planner
          </div>

          <h1 className="text-2xl font-black tracking-tight text-stone-950 sm:text-3xl md:text-4xl">
            {siteConfig.h1}
          </h1>

          <p className="max-w-3xl text-sm leading-relaxed text-stone-600 sm:text-base">
            Never guess or do stressful holiday calendar math. Enter your turkey weight and target oven time below to get the <strong>exact day and hour</strong> to move your bird from the freezer into the refrigerator.
          </p>

          {/* Timezone-neutral USDA fact for search crawlers & initial page load */}
          <div className="mt-3 rounded-xl border border-stone-200 bg-stone-100/60 p-3 text-xs leading-relaxed text-stone-700">
            <strong>Official USDA Thawing Fact:</strong> A 15 lb turkey needs 80 hours (approx. 3.3 days) in a 40°F refrigerator (24 hours per 4.5 lbs). Thawing in cold water takes 30 minutes per pound with water changed every 30 minutes.
          </div>
        </section>

        {/* Above-the-fold Interactive Micro-Tool */}
        <TurkeyCalculator />

        {/* Semantic FAQ Section */}
        <FaqSection />

        {/* Second CLS-Safe Ad Slot (728x90 Leaderboard Banner) */}
        <div className="mt-10">
          <AdPlaceholder variant="banner" />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-stone-200 bg-white py-8 text-xs text-stone-600">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-stone-800">
              TurkeyThawClock &bull; Zero-cost, 100% client-side Thanksgiving countdown utility.
            </p>
            <p className="text-stone-600">
              Follows USDA Food Safety &amp; Inspection Service (FSIS) thawing guidelines.
            </p>
          </div>

          <p className="text-stone-600 text-[11px] leading-relaxed border-t border-stone-100 pt-3">
            {siteConfig.affiliates.disclosure} All product names, logos, and brands are property of their respective owners.
          </p>

          <p className="text-stone-600 text-[11px]">
            &copy; {new Date().getFullYear()} TurkeyThawClock. Built for stress-free holiday feasts.
          </p>
        </div>
      </footer>
    </>
  );
}
