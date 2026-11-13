import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Use — TurkeyThaw',
  description:
    'Terms of Use and food safety disclaimers for TurkeyThaw USDA holiday thawing schedule and battle board.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-[#FAF9F5] text-[#111111] antialiased selection:bg-[#EA580C] selection:text-white font-sans">
      {/* Header */}
      <header className="border-b border-[#E6E4DD] bg-[#FAF9F5]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-full bg-[#FFF0E5] text-[#EA580C] font-black text-sm flex items-center justify-center group-hover:scale-105 transition-transform">
              🦃
            </span>
            <span className="font-bold text-lg text-[#111111] tracking-tight">
              Turkey<span className="text-[#EA580C]">Thaw</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-[#EA580C] hover:text-[#C2410C] flex items-center gap-1 transition-colors"
          >
            ← Back to Calculator
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <article className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <header className="space-y-2 border-b border-[#E6E4DD] pb-6">
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#EA580C] bg-[#FFF0E5] px-2.5 py-1 rounded-full">
            Legal & Compliance
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
            Terms of Use
          </h1>
          <p className="text-sm text-stone-500 font-mono">Last updated: November 2026</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#111111]">1. Acceptance of Terms</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            By accessing or using TurkeyThaw (&quot;the Service&quot;), hosted at turkeythaw.pages.dev and turkeythaw.com,
            you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the tool.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#111111]">2. Culinary Guidance & Food Safety Disclaimer</h2>
          <div className="bg-[#FFF8F2] border border-[#FCD4BA] rounded-2xl p-5 space-y-2">
            <h3 className="text-sm font-bold text-[#9A3412] uppercase tracking-wide">
              Important Food Safety Warning
            </h3>
            <p className="text-xs leading-relaxed text-[#7C2D12]">
              TurkeyThaw calculations are algorithmic estimates derived from United States Department of Agriculture
              (USDA FSIS) thermal conduction baselines (approx. 24 hours per 4–5 lbs in a ≤40°F refrigerator, or 30 minutes
              per pound in a cold water bath). Individual refrigerator temperatures, water replenishment frequency, cavity
              ice density, and ambient humidity vary.
            </p>
          </div>
          <p className="text-sm leading-relaxed text-stone-700">
            <strong>Always verify food safety:</strong> Never rely on time alone to determine food safety. Always insert
            a calibrated instant-read digital food thermometer into the thickest part of the breast and the innermost part
            of the thigh and wing to verify an internal temperature of at least <strong>165°F (74°C)</strong> before
            consuming poultry products.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#111111]">3. Affiliate Marketing Disclosure</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            TurkeyThaw participates in affiliate marketing programs, including partnerships with ThermoWorks and Walmart
            via affiliate networks such as AvantLink. Links to recommended thermometers, roasting pans, and accessories
            may generate an affiliate referral commission at zero additional cost to you. Product availability, specifications,
            and prices are determined solely by the respective merchants and are subject to change without notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#111111]">4. Permitted Use & Intellectual Property</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            TurkeyThaw is provided for personal, non-commercial holiday meal planning. You may generate schedules, download
            calendar reminders (.ICS files), and print kitchen cheat sheets for your personal household use. Systematic scraping,
            commercial redistribution of artwork, or reverse-engineering without prior consent is prohibited.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#111111]">5. Limitation of Liability</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            TurkeyThaw and its creators provide this website &quot;as is&quot; without warranties of any kind. Under no circumstances
            shall TurkeyThaw be liable for any direct, indirect, incidental, or consequential damages resulting from the use or
            inability to use this tool, including meal preparation delays or improper food handling.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#111111]">6. Modifications to the Service</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            We reserve the right to modify, update, or discontinue any feature of TurkeyThaw at any time without notice.
            Continued use of the website following any changes constitutes acceptance of the revised Terms of Use.
          </p>
        </section>
      </article>

      {/* Footer */}
      <footer className="border-t border-[#E6E4DD] py-8 text-center text-xs text-stone-500">
        <div className="max-w-4xl mx-auto px-6 space-y-2">
          <p>© 2026 TurkeyThaw. All rights reserved.</p>
          <div className="flex justify-center gap-4 text-stone-600">
            <Link href="/" className="hover:text-[#EA580C]">
              Calculator
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[#EA580C]">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="text-[#EA580C] font-semibold">
              Terms of Use
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
