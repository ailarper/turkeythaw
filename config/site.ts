/**
 * Site configuration, SEO metadata, and monetization links.
 * Read from environment variables with safe defaults.
 */

export const siteConfig = {
  name: 'TurkeyThawClock',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://turkeythawclock.pages.dev',
  title: 'Turkey Thaw Clock: USDA Refrigerator & Cold Water Thawing Calculator',
  h1: 'Turkey Thawing Calculator: When to Put Turkey in the Fridge',
  description:
    'Free turkey thawing calculator: Calculate the exact day and hour to put your turkey in the fridge or cold water bath so it thaws safely in time for holiday dinner.',
  keywords: [
    'turkey thawing calculator',
    'when to put turkey in the fridge',
    'how long to thaw a turkey',
    'turkey thaw time calculator',
    'cold water turkey thaw calculator',
    'thaw turkey in fridge calculator',
    'thanksgiving turkey thaw schedule',
  ],
  author: 'TurkeyThawClock',
  affiliates: {
    disclosure:
      'We independently test and review kitchen gear. When you buy through our links, we may earn an affiliate commission at zero additional cost to you.',
    products: [
      {
        id: 'thermapen',
        name: 'ThermoWorks Thermapen ONE',
        category: 'Instant-Read Digital Thermometer',
        tagline: '1-Second Reading • ±0.5°F Accuracy',
        description:
          'The #1 chef-trusted instant probe. Displays true internal temperature in 1 second with auto-rotating backlit screen to verify the critical 165°F USDA milestone.',
        specs: ['1-Second Read Time', '±0.5°F Precision', '360° Auto-Rotating Backlight'],
        priceHint: '$109.00',
        badge: 'Editor’s Pick',
        imageUrl:
          'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=600&q=80',
        url:
          process.env.NEXT_PUBLIC_THERMAPEN_AFFILIATE_URL ||
          'https://www.thermoworks.com/thermapen-one/?tw=turkeythaw',
        ctaText: 'View Thermapen ONE',
      },
      {
        id: 'knife-set',
        name: 'Cutluxe Carving Knife & Fork Set',
        category: 'Precision Carving Set',
        tagline: 'German High-Carbon Steel • 9" Slicer',
        description:
          'Razor-sharp forged blade with 56+ Rockwell hardness. Slices paper-thin breast cuts without shredding and separates leg joints with surgeon-like confidence.',
        specs: ['German ThyssenKrupp Steel', '56+ Rockwell Hardness', 'Ergonomic Pakkawood'],
        priceHint: '$49.99',
        badge: 'Top Carving Set',
        imageUrl:
          'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=600&q=80',
        url:
          process.env.NEXT_PUBLIC_KNIFE_SET_URL ||
          'https://www.amazon.com/dp/B0852M4S3Z?tag=turkeythaw-20',
        ctaText: 'View Knife Set',
      },
      {
        id: 'roasting-pan',
        name: 'Cuisinart Tri-Ply Roasting Pan with V-Rack',
        category: 'Heavy-Duty Roasting Pan',
        tagline: '16-Inch Stainless • Holds 25 lb Bird',
        description:
          'Heavy gauge tri-ply stainless steel with riveted cast handles. The elevated nonstick V-rack ensures 360° convection heat circulation for crispy skin all around.',
        specs: ['Tri-Ply Stainless Clad', 'Holds Up to 25 lb Bird', 'Nonstick Elevated V-Rack'],
        priceHint: '$69.95',
        badge: 'Essential Hardware',
        imageUrl:
          'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=600&q=80',
        url:
          process.env.NEXT_PUBLIC_ROASTING_PAN_URL ||
          'https://www.amazon.com/dp/B00008CM6A?tag=turkeythaw-20',
        ctaText: 'View Roasting Pan',
      },
      {
        id: 'roaster-oven',
        name: 'Oster 22-Quart Countertop Roaster Oven',
        category: 'Countertop Roaster Oven',
        tagline: 'Frees Main Oven • Fits Up to 26 lb Turkey',
        description:
          'Save your main kitchen oven for casseroles and pies. Features a self-basting lid that continually recirculates turkey juices for exceptionally tender, golden meat.',
        specs: ['22-Quart Capacity', 'Self-Basting Lid Design', 'Adjustable 150°–450°F Dial'],
        priceHint: '$79.99',
        badge: 'Holiday Lifesaver',
        imageUrl:
          'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
        url:
          process.env.NEXT_PUBLIC_ROASTER_OVEN_URL ||
          'https://www.amazon.com/dp/B00451B7T4?tag=turkeythaw-20',
        ctaText: 'View Roaster Oven',
      },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
