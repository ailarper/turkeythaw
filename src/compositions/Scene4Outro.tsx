import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Watermark } from '../components/Watermark';

interface Scene4OutroProps {
  isVertical?: boolean;
}

export const Scene4Outro: React.FC<Scene4OutroProps> = ({ isVertical = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Bouncy spring config
  const bouncyConfig = { mass: 0.5, damping: 10, stiffness: 120 };

  // Entrance springs with bouncy overshoot
  const headlineSpring = spring({
    frame: frame - 10,
    fps,
    config: bouncyConfig,
  });

  const subheadSpring = spring({
    frame: frame - 32,
    fps,
    config: bouncyConfig,
  });

  const ctaSpring = spring({
    frame: frame - 55,
    fps,
    config: bouncyConfig,
  });

  const badgesSpring = spring({
    frame: frame - 82,
    fps,
    config: bouncyConfig,
  });

  // Button Shimmer effect
  const shimmerProgress = (frame % 100) / 100;
  const shimmerX = interpolate(shimmerProgress, [0, 1], [-130, 270]);

  // Subtle breathing pulse on CTA button
  const ctaPulse = Math.sin(frame * 0.1) * 0.025 + 1;

  // Gentle fade to black at the very end (frames 285 to 300)
  const finalFade = interpolate(frame, [285, 300], [1, 0.95], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        opacity: finalFade,
      }}
      className="absolute inset-0 flex flex-col items-center justify-center p-8 select-none overflow-hidden z-10"
    >
      {/* Background massive drifting watermark */}
      <Watermark speed={0.9} opacity={0.05} />

      {/* Center Callout Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-4">
        {/* Monospace Micro Tag */}
        <div
          style={{
            opacity: interpolate(headlineSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(headlineSpring, [0, 1], [25, 0])}px) scale(${interpolate(
              headlineSpring,
              [0, 1],
              [0.85, 1]
            )})`,
          }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/40 bg-orange-950/30 text-orange-400 font-mono text-xs uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(234,88,12,0.25)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
          <span>// FREE PUBLIC UTILITY</span>
        </div>

        {/* Headline with Bouncy Spring Physics */}
        <h2
          style={{
            opacity: interpolate(headlineSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(headlineSpring, [0, 1], [40, 0])}px) scale(${interpolate(
              headlineSpring,
              [0, 1],
              [0.88, 1]
            )})`,
          }}
          className={`font-sans tracking-[-0.04em] font-black text-white leading-[1.08] drop-shadow-lg ${
            isVertical ? 'text-6xl sm:text-7xl max-w-xl' : 'text-6xl md:text-7xl lg:text-8xl'
          }`}
        >
          Don't ruin <br />
          <span className="text-orange-500 drop-shadow-[0_0_40px_rgba(234,88,12,0.55)]">
            Thanksgiving dinner.
          </span>
        </h2>

        {/* Subhead */}
        <p
          style={{
            opacity: interpolate(subheadSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(subheadSpring, [0, 1], [30, 0])}px) scale(${interpolate(
              subheadSpring,
              [0, 1],
              [0.9, 1]
            )})`,
          }}
          className={`mt-6 text-neutral-300 font-sans font-medium leading-relaxed ${
            isVertical ? 'text-2xl max-w-lg' : 'text-xl md:text-2xl max-w-2xl'
          }`}
        >
          Calculate your precise thaw time in 2 seconds.
        </p>

        {/* Action Button: Glowing rounded-full pill with bouncy spring entrance */}
        <div
          style={{
            opacity: interpolate(ctaSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(ctaSpring, [0, 1], [40, 0])}px) scale(${
              interpolate(ctaSpring, [0, 1], [0.8, 1]) * ctaPulse
            })`,
          }}
          className="mt-10 relative group"
        >
          <div
            style={{
              boxShadow: '0 0 55px rgba(234, 88, 12, 0.7), 0 0 110px rgba(234, 88, 12, 0.3)',
            }}
            className="relative overflow-hidden inline-flex items-center gap-3.5 px-9 md:px-11 py-4 md:py-5 rounded-full bg-[#EA580C] text-white font-sans font-extrabold text-lg md:text-xl border border-orange-400/80 transition-transform cursor-pointer"
          >
            {/* Shimmer light bar */}
            <div
              style={{
                transform: `translateX(${shimmerX}%) rotate(25deg)`,
              }}
              className="absolute inset-0 w-28 h-full bg-gradient-to-r from-transparent via-white/45 to-transparent pointer-events-none"
            />

            <span className="relative z-10 tracking-tight drop-shadow-sm">
              Calculate Free at turkeythawclock.pages.dev
            </span>
            <span className="relative z-10 text-white font-mono text-xl">↗</span>
          </div>
        </div>

        {/* Trust Badges */}
        <div
          style={{
            opacity: interpolate(badgesSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(badgesSpring, [0, 1], [25, 0])}px) scale(${interpolate(
              badgesSpring,
              [0, 1],
              [0.85, 1]
            )})`,
          }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-neutral-400 uppercase tracking-wider"
        >
          <span className="flex items-center gap-1.5 font-semibold text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            USDA Guidelines
          </span>
          <span>•</span>
          <span className="font-semibold text-neutral-300">100% Free & Open Source</span>
          <span>•</span>
          <span className="font-semibold text-neutral-300">Zero Trackers or Ads</span>
        </div>
      </div>
    </div>
  );
};
