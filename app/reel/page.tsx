'use client';

import React, { useEffect, useState, useRef } from 'react';
import TurkeyThawPage from '../page';

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

export default function ReelCapturePage() {
  const [mode, setMode] = useState<'9x16' | '16x9'>('9x16');
  const stageWindowRef = useRef<HTMLDivElement>(null);
  const cameraRigRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      if (urlMode === '16x9' || urlMode === 'stage' || urlMode === 'landscape') {
        setMode('16x9');
      } else if (urlMode === '9x16' || urlMode === 'vertical') {
        setMode('9x16');
      } else if (window.innerWidth > window.innerHeight) {
        setMode('16x9');
      }

      const triggered: Record<string, boolean> = {};

      // Deterministic Macro Camera Controller
      (window as unknown as { __setReelTime: (t: number) => void }).__setReelTime = (t: number) => {
        // Stage Window viewport: 960 x 680 -> Center is (480, 340)
        let tx = 720;
        let ty = 390;
        let scale = 1.16;

        // Cursor position inside the 960x680 stage
        let cx = 480;
        let cy = 340;
        let cursorVisible = false;
        let clickTime = -1;

        // -----------------------------------------------------------------
        // Shot 1 (0.0s – 3.5s) | Real Hero Artwork & Headline
        // -----------------------------------------------------------------
        if (t < 2.0) {
          // Frame golden roasted turkey, navbar & headline
          const p = easeInOutCubic(t / 2.0);
          tx = 720;
          ty = lerp(320, 390, p);
          scale = 1.16;

          cursorVisible = true;
          cx = lerp(750, 720, p);
          cy = lerp(300, 340, p);
        } else if (t < 3.5) {
          // Pan down to Plan dinner -> button
          const p = easeInOutCubic((t - 2.0) / 1.5);
          tx = 720;
          ty = lerp(390, 480, p);
          scale = lerp(1.16, 1.25, p);

          cursorVisible = true;
          cx = lerp(720, 480, p);
          cy = lerp(340, 320, p);
          if (t >= 3.0 && t <= 3.4) clickTime = 3.0;
        }

        // -----------------------------------------------------------------
        // Shot 2 (3.5s – 8.0s) | Real Section 2 Calculator (Left Column Macro)
        // -----------------------------------------------------------------
        else if (t < 4.8) {
          // Glide down into Section 2 Turkey Weight track
          const p = easeInOutCubic((t - 3.5) / 1.3);
          tx = lerp(720, 560, p);
          ty = lerp(480, 1150, p);
          scale = lerp(1.25, 1.35, p);

          cursorVisible = true;
          cx = lerp(480, 620, p);
          cy = lerp(320, 290, p);
        } else if (t < 6.2) {
          // Focus on Turkey Weight track & click 20 lbs (at 4.8s) -> Thaw Method
          tx = 560;
          ty = 1150;
          scale = 1.35;

          cursorVisible = true;
          if (t < 5.4) {
            // Click 20 lbs
            cx = 620;
            cy = 290;
            if (t >= 4.8 && t <= 5.2) clickTime = 4.8;
          } else {
            // Glide cursor to Cold Water Bath card
            const p = easeInOutCubic((t - 5.4) / 0.8);
            cx = lerp(620, 680, p);
            cy = lerp(290, 420, p);
            if (t >= 6.0 && t <= 6.4) clickTime = 6.0;
          }
        } else if (t < 8.0) {
          // Pan down to reveal real Start Thawing card with watercolor plate & 3:00 AM
          const p = easeInOutCubic((t - 6.2) / 1.8);
          tx = 560;
          ty = lerp(1150, 1420, p);
          scale = lerp(1.35, 1.40, p);

          cursorVisible = true;
          cx = lerp(680, 560, p);
          cy = lerp(420, 360, p);
        }

        // -----------------------------------------------------------------
        // Shot 3 (8.0s – 11.5s) | Real Section 3 USDA 165°F Guide & Emergency
        // -----------------------------------------------------------------
        else if (t < 9.4) {
          // Glide to Section 3: 165°F turkey illustration on left, emergency cards on right
          const p = easeInOutCubic((t - 8.0) / 1.4);
          tx = lerp(560, 520, p);
          ty = lerp(1420, 1920, p);
          scale = lerp(1.40, 1.18, p);

          cursorVisible = true;
          cx = lerp(560, 680, p);
          cy = lerp(360, 380, p);
        } else if (t < 11.5) {
          // Move right to Emergency Card 1 and open full-column drawer
          const p = easeInOutCubic((t - 9.4) / 0.8);
          tx = lerp(520, 840, p);
          ty = 1940;
          scale = 1.25;

          cursorVisible = true;
          cx = 680;
          cy = 380;
          if (t >= 9.8 && t <= 10.2) clickTime = 9.8;

          if (t >= 11.0 && t <= 11.4) {
            clickTime = 11.2;
            cx = 660;
            cy = 330;
          }
        }

        // -----------------------------------------------------------------
        // Shot 4 (11.5s – 16.0s) | Real Section 4 Illustrated 5-Step Battle Board
        // -----------------------------------------------------------------
        else if (t < 12.8) {
          // Glide to Section 4: Dinner Time 5:00 PM pill & title
          const p = easeInOutCubic((t - 11.5) / 1.3);
          tx = lerp(840, 720, p);
          ty = lerp(1940, 2560, p);
          scale = lerp(1.25, 1.38, p);

          cursorVisible = false;
        } else if (t < 16.0) {
          // Smooth horizontal pan across all 5 real illustrated turkey cards!
          const p = easeInOutCubic((t - 12.8) / 3.2);
          tx = lerp(340, 1100, p);
          ty = 2700;
          scale = 1.48;

          cursorVisible = false;
        }

        // -----------------------------------------------------------------
        // Shot 5 (16.0s – 18.0s) | Real Dark Footer Lockup
        // -----------------------------------------------------------------
        else {
          // Smoothly frame the real single dark footer at bottom of Section 4
          const p = easeInOutCubic((t - 16.0) / 1.5);
          tx = lerp(1100, 720, p);
          ty = lerp(2700, 3180, p);
          scale = lerp(1.48, 2.5, p);

          cursorVisible = false;
        }

        // Seamlessly match stage background to dark footer during finale
        if (stageWindowRef.current) {
          stageWindowRef.current.style.backgroundColor = t >= 16.0 ? '#1B1A18' : '#FAF8F5';
        }

        // Apply Macro Camera Transformation to the live website
        if (cameraRigRef.current) {
          cameraRigRef.current.style.transform = `translate3d(480px, 340px, 0) scale(${scale.toFixed(4)}) translate3d(${-tx.toFixed(1)}px, ${-ty.toFixed(1)}px, 0)`;
        }

        // Position simulated cursor & ripple inside stage window
        if (cursorRef.current) {
          cursorRef.current.style.display = cursorVisible ? 'block' : 'none';
          cursorRef.current.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
        }

        if (rippleRef.current) {
          if (clickTime > 0) {
            const rp = (t - clickTime) / 0.4;
            if (rp >= 0 && rp <= 1) {
              rippleRef.current.style.transform = `translate(-50%, -50%) scale(${(rp * 2.2).toFixed(2)})`;
              rippleRef.current.style.opacity = (1 - rp).toFixed(2);
            } else {
              rippleRef.current.style.opacity = '0';
            }
          } else {
            rippleRef.current.style.opacity = '0';
          }
        }

        // -----------------------------------------------------------------
        // Trigger Real Interactive State on app/page.tsx
        // -----------------------------------------------------------------
        if (t >= 4.8 && !triggered['4.8']) {
          triggered['4.8'] = true;
          const btn = Array.from(document.querySelectorAll('#dashboard button')).find(
            (b) => b.textContent?.trim() === '20 lbs'
          );
          if (btn) (btn as HTMLButtonElement).click();
        }

        if (t >= 6.0 && !triggered['6.0']) {
          triggered['6.0'] = true;
          const btn = Array.from(document.querySelectorAll('#dashboard button')).find(
            (b) => b.textContent?.includes('Cold Water Bath')
          );
          if (btn) (btn as HTMLButtonElement).click();
        }

        if (t >= 9.8 && !triggered['9.8']) {
          triggered['9.8'] = true;
          const btn = Array.from(document.querySelectorAll('#guide button')).find(
            (b) =>
              b.getAttribute('aria-label')?.includes('Morning Panic') ||
              b.textContent?.includes('Morning Panic')
          );
          if (btn) (btn as HTMLButtonElement).click();
        }

        if (t >= 11.2 && !triggered['11.2']) {
          triggered['11.2'] = true;
          const closeBtn =
            document.querySelector('#guide [aria-label="Close drawer"]') ||
            Array.from(document.querySelectorAll('#guide button')).find((b) =>
              b.getAttribute('aria-label')?.includes('Morning Panic')
            );
          if (closeBtn) (closeBtn as HTMLButtonElement).click();
        }

        if (t >= 12.0 && !triggered['12.0']) {
          triggered['12.0'] = true;
          const sel = document.querySelector('#timeline select') as HTMLSelectElement | null;
          if (sel) {
            sel.value = '17:00';
            sel.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      };
    }
  }, []);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700&display=swap');

        .font-editorial {
          font-family: 'Instrument Serif', 'Newsreader', Georgia, serif;
        }

        /* Prevent unwanted scroll bars during capture */
        ::-webkit-scrollbar {
          display: none;
        }
      `,
        }}
      />

      <main
        className={`relative overflow-hidden bg-[#000000] text-white select-none flex flex-col items-center justify-between ${
          mode === '9x16' ? 'w-[1080px] h-[1920px] py-24' : 'w-[1920px] h-[1080px] py-8'
        }`}
        style={{ width: mode === '9x16' ? 1080 : 1920, height: mode === '9x16' ? 1920 : 1080 }}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#EA580C]/15 blur-[140px] pointer-events-none rounded-full" />

        {/* ------------------------------------------------------------- */}
        {/* Top Header: Two-line high-impact hook (No tacky top badge!)    */}
        {/* ------------------------------------------------------------- */}
        <header className="relative z-10 text-center px-6 max-w-[940px]">
          <h1 className="font-editorial text-[56px] leading-[1.08] tracking-tight">
            <span className="block text-[#EA580C] font-normal drop-shadow-[0_4px_24px_rgba(234,88,12,0.4)]">
              TurkeyThaw Just Turned Holiday Prep
            </span>
            <span className="block text-white font-normal mt-1 drop-shadow-[0_4px_24px_rgba(255,255,255,0.2)]">
              Into a 10-Second Science.
            </span>
          </h1>
        </header>

        {/* ------------------------------------------------------------- */}
        {/* Center Stage: 960x680 Rounded-3xl Window with REAL Website    */}
        {/* ------------------------------------------------------------- */}
        <div
          ref={stageWindowRef}
          className={`relative z-20 w-[960px] h-[680px] bg-[#FAF8F5] rounded-[32px] border border-white/10 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.95)] ${
            mode === '16x9' ? 'scale-[1.14] origin-center' : ''
          }`}
        >
          {/* Live Camera Rig holding the REAL website */}
          <div
            ref={cameraRigRef}
            className="absolute top-0 left-0 w-[1440px] pointer-events-auto"
            style={{
              transformOrigin: '0 0',
              willChange: 'transform',
            }}
          >
            <TurkeyThawPage />
          </div>

          {/* Simulated Cursor inside stage */}
          <div
            ref={cursorRef}
            className="absolute top-0 left-0 z-50 pointer-events-none"
            style={{
              display: 'none',
              willChange: 'transform',
            }}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 28 28"
              fill="none"
              style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.45))' }}
            >
              <path
                d="M4 2L22 13.5L13.5 15.5L8.5 24.5L4 2Z"
                fill="#1B1A18"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
            </svg>

            {/* Click Ripple Indicator */}
            <div
              ref={rippleRef}
              style={{
                position: 'absolute',
                top: '3px',
                left: '4px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '2.5px solid #EA580C',
                backgroundColor: 'rgba(234, 88, 12, 0.35)',
                transform: 'translate(-50%, -50%) scale(0)',
                opacity: 0,
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Bottom Minimal Footer                                         */}
        {/* ------------------------------------------------------------- */}
        <footer className="relative z-10 text-center text-xs text-neutral-400 tracking-wider">
          <span className="font-semibold text-neutral-200">turkeythaw.pages.dev</span>
          <span className="mx-2 text-neutral-600">•</span>
          <span>Backed by USDA FSIS Conduction Models</span>
        </footer>
      </main>
    </>
  );
}
