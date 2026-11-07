import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface AmbientBackgroundProps {
  isVertical?: boolean;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ isVertical = false }) => {
  const frame = useCurrentFrame();

  // Floating ambient orb 1 motion (warm amber)
  const orb1X = Math.sin(frame * 0.015) * 120;
  const orb1Y = Math.cos(frame * 0.02) * 80;
  const orb1Scale = 1 + Math.sin(frame * 0.025) * 0.15;

  // Floating ambient orb 2 motion (deep orange)
  const orb2X = Math.cos(frame * 0.018) * 140;
  const orb2Y = Math.sin(frame * 0.022) * 90;
  const orb2Scale = 1 + Math.cos(frame * 0.03) * 0.18;

  // Subtle breathing pulse for core light
  const corePulse = Math.sin(frame * 0.04) * 0.05 + 0.95;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Base Obsidian Slate */}
      <div className="absolute inset-0 bg-[#0B0D13]" />

      {/* Floating Orb 1 (Top Center / Left) */}
      <div
        style={{
          transform: `translate(${orb1X}px, ${orb1Y}px) scale(${orb1Scale})`,
          opacity: 0.85,
        }}
        className={`absolute -top-32 left-1/4 rounded-full bg-gradient-to-br from-orange-600/25 via-amber-700/15 to-transparent blur-[110px] ${
          isVertical ? 'w-[600px] h-[600px]' : 'w-[900px] h-[900px]'
        }`}
      />

      {/* Floating Orb 2 (Bottom Right / Center) */}
      <div
        style={{
          transform: `translate(${orb2X}px, ${orb2Y}px) scale(${orb2Scale})`,
          opacity: 0.75,
        }}
        className={`absolute -bottom-40 right-1/4 rounded-full bg-gradient-to-tl from-orange-500/20 via-orange-950/30 to-transparent blur-[120px] ${
          isVertical ? 'w-[650px] h-[650px]' : 'w-[950px] h-[950px]'
        }`}
      />

      {/* Center Ambient Core Light */}
      <div
        style={{
          transform: `scale(${corePulse})`,
          opacity: 0.6,
        }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(234,88,12,0.12)_0%,_rgba(11,13,19,0.4)_50%,_rgba(11,13,19,0.95)_100%)]"
      />

      {/* Subtle Engineered Grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: isVertical ? '48px 48px' : '64px 64px',
        }}
      />

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(11,13,19,0.85)_100%)]" />
    </div>
  );
};
