/**
 * Site configuration, SEO metadata, and monetization links.
 * Read from environment variables with safe defaults.
 */

export const siteConfig = {
  name: 'TurkeyThawClock',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://turkeythawclock.com',
  title: 'Turkey Thawing Calculator: When to Put Turkey in the Fridge',
  h1: 'Turkey Thawing Calculator: When to Put Turkey in the Fridge',
  description:
    'Free turkey thawing calculator: Find out exactly when to put your turkey in the fridge so it thaws safely in time for Thanksgiving or Christmas dinner.',
  keywords: [
    'turkey thawing calculator',
    'when to put turkey in the fridge',
    'how long to thaw a turkey',
    'turkey thaw time calculator',
    'thaw turkey in fridge calculator',
    'thanksgiving turkey thaw schedule',
  ],
  author: 'TurkeyThawClock',
  affiliates: {
    disclosure:
      'We independently test and review products. When you buy through our links, we may earn an affiliate commission at no extra cost to you.',
    thermapen: {
      name: 'ThermoWorks Thermapen ONE',
      tagline: 'The Gold Standard Instant-Read Thermometer',
      description:
        'Full temperature reading in 1 second with ±0.5°F accuracy. The #1 trusted kitchen thermometer by professional chefs and pitmasters.',
      url:
        process.env.NEXT_PUBLIC_THERMAPEN_AFFILIATE_URL ||
        'https://www.thermoworks.com/thermapen-one/?tw=turkeythaw',
      rel: 'sponsored noopener' as const,
      priceHint: 'From $109',
      badge: 'Editor’s Choice',
    },
    amazonLeaveInProbe: {
      name: 'ThermoPro TempSpike Truly Wireless Meat Thermometer',
      tagline: 'Leave-In Probe with Real-Time Phone Alerts',
      description:
        '500-foot wireless Bluetooth range with twin sensors to track meat and oven temperature without opening the oven door.',
      url:
        process.env.NEXT_PUBLIC_AMAZON_PROBE_AFFILIATE_URL ||
        'https://www.amazon.com/dp/B0778WTKKY?tag=turkeythaw-20',
      rel: 'sponsored noopener' as const,
      priceHint: 'Top Rated on Amazon',
      badge: 'Best Leave-In',
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
