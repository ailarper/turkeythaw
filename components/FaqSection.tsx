'use client';

import React from 'react';
import { FAQ_ITEMS } from '@/config/faq';
import { Reveal } from '@/components/Reveal';

export const FaqSection: React.FC = () => {
  return (
    <section id="faq" className="w-full mt-20">
      <Reveal delay={0}>
        <div className="mb-8">
          <div className="font-mono text-xs uppercase tracking-widest text-orange-400 mb-2">
            {'// 05: FREQUENTLY ASKED QUESTIONS'}
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-white">
            Official Food Safety Inquiries
          </h2>
          <p className="text-sm text-neutral-400 mt-2 max-w-2xl leading-relaxed">
            Direct USDA FSIS answers to common holiday defrosting emergencies, storage limits, and biological temperature risks.
          </p>
        </div>
      </Reveal>

      <div className="border-t border-white/[0.08] divide-y divide-white/[0.08]">
        {FAQ_ITEMS.map((item, idx) => (
          <Reveal key={item.id} delay={idx * 0.05}>
            <details className="group py-5 transition-colors">
              <summary className="flex cursor-pointer list-none items-center justify-between text-left font-medium text-white sm:text-base select-none group-hover:text-orange-200">
                <span className="pr-4">{item.question}</span>
                <span className="font-mono text-xs text-neutral-500 group-open:text-orange-400 transition-colors">
                  <span className="group-open:hidden">[ + ]</span>
                  <span className="hidden group-open:inline">[ − ]</span>
                </span>
              </summary>
              <div className="pt-3 text-xs sm:text-sm leading-relaxed text-neutral-400 max-w-3xl">
                {item.answer}
              </div>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
