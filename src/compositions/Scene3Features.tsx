import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface Scene3FeaturesProps {
  isVertical?: boolean;
}

export const Scene3Features: React.FC<Scene3FeaturesProps> = ({ isVertical = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Bouncy spring config
  const bouncyConfig = { mass: 0.5, damping: 10, stiffness: 120 };

  // Header entrance with bouncy overshoot
  const headerSpring = spring({
    frame: frame - 4,
    fps,
    config: bouncyConfig,
  });

  // Staggered springs for 3 floating beats
  const beat1Spring = spring({
    frame: frame - 12,
    fps,
    config: bouncyConfig,
  });

  const beat2Spring = spring({
    frame: frame - 68,
    fps,
    config: bouncyConfig,
  });

  const beat3Spring = spring({
    frame: frame - 124,
    fps,
    config: bouncyConfig,
  });

  // Continuous organic floating waves for each card
  const floatCard1 = Math.sin(frame * 0.05) * 8;
  const floatCard2 = Math.cos(frame * 0.055 + 1.2) * 10;
  const floatCard3 = Math.sin(frame * 0.048 + 2.4) * 8;

  // Active highlights
  const isBeat1Active = frame >= 12 && frame < 80;
  const isBeat2Active = frame >= 80 && frame < 140;
  const isBeat3Active = frame >= 140;

  // Snappy scale-down zoom transition out (frames 275 to 300)
  const exitOpacity = interpolate(frame, [275, 298], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitScale = interpolate(frame, [275, 298], [1, 0.88], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Radar/Pulse animation for water rescue
  const radarWave = (frame * 0.09) % 1;

  return (
    <div
      style={{
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
      }}
      className="absolute inset-0 flex flex-col justify-center items-center p-8 md:p-14 select-none overflow-hidden z-10"
    >
      {/* Center Wrapper */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Header */}
        <div
          style={{
            opacity: interpolate(headerSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(headerSpring, [0, 1], [35, 0])}px) scale(${interpolate(
              headerSpring,
              [0, 1],
              [0.88, 1]
            )})`,
          }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/40 bg-orange-950/30 text-orange-400 font-mono text-xs uppercase tracking-wider mb-3 shadow-[0_0_20px_rgba(234,88,12,0.2)]">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span>// ARCHITECTURE & FOOD SCIENCE</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white font-sans drop-shadow-md">
            Engineered for Zero Failure.
          </h2>
        </div>

        {/* 3 Floating Staggered Feature Cards with Dynamic Tilt & Bounce */}
        <div
          className={`grid w-full gap-6 md:gap-8 items-center ${
            isVertical ? 'grid-cols-1 w-full max-w-2xl' : 'grid-cols-1 md:grid-cols-3'
          }`}
        >
          {/* Card 1: USDA Conduction Math (Floats at -2.5° tilt) */}
          <div
            style={{
              opacity: interpolate(beat1Spring, [0, 1], [0, 1]),
              transform: `translateY(${
                interpolate(beat1Spring, [0, 1], [80, 0]) + floatCard1
              }px) rotate(${isVertical ? 0 : -2.5}deg) scale(${
                interpolate(beat1Spring, [0, 1], [0.85, 1]) * (isBeat1Active ? 1.05 : 1)
              })`,
              boxShadow: isBeat1Active
                ? '0 25px 50px rgba(0,0,0,0.6), 0 0 50px rgba(234, 88, 12, 0.45)'
                : '0 15px 35px rgba(0,0,0,0.5)',
              borderColor: isBeat1Active ? 'rgba(234, 88, 12, 0.6)' : 'rgba(255, 255, 255, 0.1)',
            }}
            className="rounded-2xl border bg-[#0E1118]/95 backdrop-blur-xl p-6 md:p-7 flex flex-col justify-between transition-all duration-300 relative overflow-hidden"
          >
            <div>
              <div className="font-mono text-xs text-orange-400 font-bold tracking-wider uppercase mb-3 flex items-center justify-between">
                <span>// 01 CONDUCTION MATH</span>
                <span className="text-[10px] text-neutral-400 bg-white/[0.04] px-2 py-0.5 rounded">USDA STANDARD</span>
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold text-white mb-2 font-sans tracking-tight">
                24 Hours per 4.5 lbs
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                Rigorous non-linear thermodynamic formulas. Zero dangerous guesswork in the kitchen.
              </p>
            </div>

            {/* SVG Visual: Heat transfer curve */}
            <div className="mt-6 pt-4 border-t border-white/[0.08]">
              <div className="flex items-center justify-between font-mono text-xs text-neutral-300 mb-2">
                <span>Thermal Diffusion</span>
                <span className="text-orange-400 font-bold">40°F Safe Constant</span>
              </div>
              <svg className="w-full h-14" viewBox="0 0 200 60" fill="none">
                <path
                  d="M0 50 Q 50 45, 100 25 T 200 10"
                  stroke="#EA580C"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="25" r="5" fill="#EA580C" />
                <circle cx="200" cy="10" r="5" fill="#EA580C" />
                <line x1="0" y1="55" x2="200" y2="55" stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
              </svg>
            </div>
          </div>

          {/* Card 2: Cold Water Rescue (Floats at +2° tilt) */}
          <div
            style={{
              opacity: interpolate(beat2Spring, [0, 1], [0, 1]),
              transform: `translateY(${
                interpolate(beat2Spring, [0, 1], [80, 0]) + floatCard2
              }px) rotate(${isVertical ? 0 : 2}deg) scale(${
                interpolate(beat2Spring, [0, 1], [0.85, 1]) * (isBeat2Active ? 1.05 : 1)
              })`,
              boxShadow: isBeat2Active
                ? '0 25px 50px rgba(0,0,0,0.6), 0 0 50px rgba(56, 189, 248, 0.4)'
                : '0 15px 35px rgba(0,0,0,0.5)',
              borderColor: isBeat2Active ? 'rgba(56, 189, 248, 0.6)' : 'rgba(255, 255, 255, 0.1)',
            }}
            className="rounded-2xl border bg-[#0E1118]/95 backdrop-blur-xl p-6 md:p-7 flex flex-col justify-between transition-all duration-300 relative overflow-hidden"
          >
            <div>
              <div className="font-mono text-xs text-sky-400 font-bold tracking-wider uppercase mb-3 flex items-center justify-between">
                <span>// 02 WATER RESCUE</span>
                <span className="text-[10px] text-neutral-400 bg-white/[0.04] px-2 py-0.5 rounded">EMERGENCY PROTOCOL</span>
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold text-white mb-2 font-sans tracking-tight">
                30-Min Rotation Cycles
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                Submerged water convection bath with automatic cadence reminders for speed thaw.
              </p>
            </div>

            {/* SVG Visual: Water radar ring */}
            <div className="mt-6 pt-4 border-t border-white/[0.08]">
              <div className="flex items-center justify-between font-mono text-xs text-neutral-300 mb-2">
                <span>Cycle Frequency</span>
                <span className="text-sky-400 font-bold tabular-nums">30m : 00s</span>
              </div>
              <div className="h-14 flex items-center justify-center relative">
                <div
                  style={{
                    transform: `scale(${1 + radarWave * 0.9})`,
                    opacity: 1 - radarWave,
                  }}
                  className="absolute w-14 h-14 rounded-full border-2 border-sky-400"
                />
                <div className="w-9 h-9 rounded-full bg-sky-500/25 border border-sky-400 flex items-center justify-center font-mono text-xs text-sky-200 font-extrabold shadow-sm">
                  30m
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Zero Lag & 0 CLS (Floats at -1.5° tilt) */}
          <div
            style={{
              opacity: interpolate(beat3Spring, [0, 1], [0, 1]),
              transform: `translateY(${
                interpolate(beat3Spring, [0, 1], [80, 0]) + floatCard3
              }px) rotate(${isVertical ? 0 : -1.5}deg) scale(${
                interpolate(beat3Spring, [0, 1], [0.85, 1]) * (isBeat3Active ? 1.05 : 1)
              })`,
              boxShadow: isBeat3Active
                ? '0 25px 50px rgba(0,0,0,0.6), 0 0 50px rgba(16, 185, 129, 0.4)'
                : '0 15px 35px rgba(0,0,0,0.5)',
              borderColor: isBeat3Active ? 'rgba(16, 185, 129, 0.6)' : 'rgba(255, 255, 255, 0.1)',
            }}
            className="rounded-2xl border bg-[#0E1118]/95 backdrop-blur-xl p-6 md:p-7 flex flex-col justify-between transition-all duration-300 relative overflow-hidden"
          >
            <div>
              <div className="font-mono text-xs text-emerald-400 font-bold tracking-wider uppercase mb-3 flex items-center justify-between">
                <span>// 03 CLIENT-SIDE SPEED</span>
                <span className="text-[10px] text-neutral-400 bg-white/[0.04] px-2 py-0.5 rounded">100% OFFLINE</span>
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold text-white mb-2 font-sans tracking-tight">
                Zero Lag & 0 CLS
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                Pure client-side reactivity. Instant calculations directly inside your kitchen browser.
              </p>
            </div>

            {/* SVG Visual: Speed metric */}
            <div className="mt-6 pt-4 border-t border-white/[0.08]">
              <div className="flex items-center justify-between font-mono text-xs text-neutral-300 mb-2">
                <span>Latency</span>
                <span className="text-emerald-400 font-extrabold font-mono">0.0 ms Instant</span>
              </div>
              <div className="h-14 flex items-center justify-between px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-xs text-neutral-200 font-medium">Layout Shift</span>
                </div>
                <span className="font-mono text-sm font-black text-emerald-400">0.00 CLS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
