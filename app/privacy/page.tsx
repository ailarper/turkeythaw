import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — TurkeyThaw',
  description:
    'Privacy Policy for TurkeyThaw. Learn how we handle information, cookies, and affiliate partner disclosures.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-stone-500 font-mono">Last updated: November 2026</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#111111]">1. Overview</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            TurkeyThaw (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) provides a free, scientifically timed turkey
            thawing schedule and cook-day planning tool based strictly on USDA FSIS safety guidelines.
            We respect your privacy and are committed to transparency in all of our digital practices.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#111111]">2. Information We Process</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            <strong>Client-Side Calculator Data:</strong> The values you enter into TurkeyThaw (such as
            turkey weight, thawing method, and target dinner time) are processed locally inside your web
            browser. We do not store, sell, or collect your personal dietary choices or calendar events
            on remote databases.
          </p>
          <p className="text-sm leading-relaxed text-stone-700">
            <strong>Technical Log Data:</strong> Like most standard websites, our hosting providers (such
            as Cloudflare Pages) may automatically log standard HTTP request metadata (IP address, browser
            user agent, operating system, and referral URLs) for security, DDoS mitigation, and performance monitoring.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#111111]">3. Affiliate Programs & Outbound Links</h2>
          <div className="bg-[#FFF8F2] border border-[#FCD4BA] rounded-2xl p-5 space-y-2">
            <h3 className="text-sm font-bold text-[#9A3412] uppercase tracking-wide">
              FTC Affiliate Disclosure
            </h3>
            <p className="text-xs leading-relaxed text-[#7C2D12]">
              TurkeyThaw participates in affiliate marketing programs, including AvantLink, ThermoWorks,
              Walmart, and other retail partners. When you click on external gear links or purchase
              recommended holiday kitchen equipment through our site, we may receive a commission from
              the retailer at zero additional cost to you.
            </p>
          </div>
          <p className="text-sm leading-relaxed text-stone-700">
            When you click an affiliate link, a temporary tracking cookie or parameter may be placed by
            the respective affiliate network (e.g., AvantLink) to verify that the referral originated
            from TurkeyThaw. These third-party retailers have their own independent privacy policies,
            which we encourage you to review.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#111111]">4. Cookies and Web Beacons</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            We do not use tracking cookies for behavioral profiling or ad-retargeting. Third-party partner
            scripts (such as affiliate confirmation tags or CDN telemetry) may use minimal operational cookies
            solely to authenticate referrals or protect server infrastructure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#111111]">5. Third-Party Services & Links</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            Our service links to external resources, including the United States Department of Agriculture
            (USDA FSIS) food safety documentation and third-party merchant sites. We are not responsible
            for the privacy policies or practices of external platforms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#111111]">6. Contact Information</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            If you have questions regarding this Privacy Policy or affiliate disclosure practices, please
            reach out via our official repository or contact channels at{' '}
            <a
              href="https://turkeythaw.pages.dev"
              className="text-[#EA580C] hover:underline font-semibold"
            >
              turkeythaw.pages.dev
            </a>
            .
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
            <Link href="/privacy" className="text-[#EA580C] font-semibold">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#EA580C]">
              Terms of Use
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

