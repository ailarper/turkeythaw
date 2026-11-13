import { ArrowUp, ExternalLink, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

const FOOTER_LINKS = [
  { href: '#calculator', label: 'Calculator' },
  { href: '#gear', label: 'Prep Kit' },
  { href: '#usda-guide', label: 'USDA Guide' },
  { href: '#battle-board', label: 'Timeline' },
  { href: '#faq', label: 'FAQ' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Use' },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#111111] py-16 text-neutral-400">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-3 lg:col-span-4">
            <BrandLogo theme="dark" />
            <p className="max-w-xs text-[12px] leading-relaxed text-neutral-400">
              Safe. Simple. Thanksgiving Ready. A precision thawing schedule built to keep your
              holiday dinner calm, on time, and food-safe.
            </p>
            <div className="flex items-center gap-1.5 pt-1 font-mono text-[11px]">
              <Sparkles className="h-3.5 w-3.5 text-[#EA580C]" aria-hidden="true" />
              <span className="font-semibold text-neutral-300">Thanksgiving 2026 Ready</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-300">
              Affiliate disclosure
            </p>
            <p className="mt-2 max-w-md text-[11px] leading-relaxed text-neutral-500">
              Affiliate Disclosure: TurkeyThaw participates in affiliate programs with ThermoWorks, Walmart, and other partners. We may earn a commission on qualifying purchases at zero added cost to you. Built strictly to USDA food safety standards.
            </p>
          </div>

          <div className="flex flex-col gap-5 lg:col-span-3 lg:items-end">
            <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2">
              {FOOTER_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[12px] font-medium text-neutral-400 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/turkey-basics-safe-thawing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-neutral-400 transition-colors hover:text-white"
              >
                <span>USDA Guidelines</span>
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </nav>

            <a
              href="#top"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-800 px-4 py-2 text-[11px] font-semibold text-neutral-200 transition-colors hover:bg-neutral-700 hover:text-white"
            >
              <span>Back to top</span>
              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-6 text-[10px] text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} TurkeyThaw (turkeythaw.pages.dev). All rights reserved.</p>
          <p className="font-mono">100% client-side · No tracking cookies</p>
        </div>
      </div>
    </footer>
  );
}
