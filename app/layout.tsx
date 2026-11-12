import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://turkeythaw.com'),
  title: 'TurkeyThaw — USDA Turkey Thaw Calculator & Cook-Day Timeline',
  description:
    'A scientifically timed schedule to safely thaw your holiday turkey — calculated backwards from the moment your roast enters the heat. Backed by USDA FSIS standards.',
  keywords: [
    'turkey thaw calculator',
    'thanksgiving turkey defrost time',
    'usda turkey thaw time',
    'cold water turkey thaw',
    'refrigerator turkey thaw',
    'cook day battle board',
    'turkey temperature guide 165',
  ],
  authors: [{ name: 'TurkeyThaw' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TurkeyThaw — Precision USDA Holiday Thawing Schedule',
    description:
      'Eliminate holiday calendar anxiety. Calculate the exact day and hour to begin thawing safely under USDA FSIS conduction models.',
    url: 'https://turkeythaw.com',
    siteName: 'TurkeyThaw',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TurkeyThaw — Precision USDA Holiday Thawing Schedule',
    description:
      'Eliminate holiday calendar anxiety. Calculate the exact day and hour to begin thawing safely under USDA FSIS conduction models.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 1440,
  initialScale: 0.25,
  maximumScale: 5.0,
  userScalable: true,
  themeColor: '#FAF9F5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sansFont.variable} ${monoFont.variable}`}>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="viewport" content="width=1440, initial-scale=0.25, maximum-scale=5.0, user-scalable=yes" />
      </head>
      <body className="min-h-screen bg-[#FAF9F5] font-sans text-[#111111] antialiased selection:bg-[#EA580C] selection:text-white">
        <Script
          src="https://classic.avantlink.com/affiliate_app_confirm.php?mode=js&authResponse=4b0e8de30a75568bf5f905f8d92ad281199f34c2"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
