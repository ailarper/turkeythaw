import React from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQ_ITEMS } from '@/config/faq';

export const FaqSection: React.FC = () => {
  return (
    <section aria-labelledby="faq-heading" className="w-full mt-10">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="h-5 w-5 text-orange-600" />
        <h2 id="faq-heading" className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">
          Frequently Asked Questions About Thawing Turkey
        </h2>
      </div>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.id}
            className="group rounded-2xl border border-stone-200 bg-white shadow-2xs transition-all open:border-orange-300 open:shadow-xs"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-left font-bold text-stone-900 transition-colors group-hover:text-orange-700 sm:text-base">
              <span className="pr-4">{item.question}</span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-500 transition-transform duration-200 group-open:rotate-180 group-open:bg-orange-100 group-open:text-orange-700">
                <ChevronDown className="h-4 w-4" />
              </span>
            </summary>
            <div className="border-t border-stone-100 px-5 pb-5 pt-3 text-sm leading-relaxed text-stone-600 sm:text-base">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
};
