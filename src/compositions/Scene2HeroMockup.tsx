import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedCursor } from '../components/AnimatedCursor';

interface Scene2HeroMockupProps {
  isVertical?: boolean;
}

export const Scene2HeroMockup: React.FC<Scene2HeroMockupProps> = ({ isVertical = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Bouncy spring config
  const bouncyConfig = { mass: 0.5, damping: 10, stiffness: 120 };

  // Entrance spring with snappy overshoot
  const enterSpring = spring({
    frame,
    fps,
    config: bouncyConfig,
  });

  // Dynamic 3D tilt + gentle floating sway
  const floatX = Math.sin(frame * 0.04) * 2;
  const floatY = Math.cos(frame * 0.035) * 2;

  const baseRotX = interpolate(frame, [0, 90, 240, 300], [8, 5, 2.5, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const baseRotY = interpolate(frame, [0, 90, 240, 300], [-7, -4, -1.5, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const rotX = baseRotX + floatX;
  const rotY = baseRotY + floatY;

  // Smooth camera zoom-in during the payoff (frames 150 to 220)
  const cameraZoom = interpolate(frame, [150, 195], [1, isVertical ? 1.04 : 1.07], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const mockScale = interpolate(enterSpring, [0, 1], [0.88, 1]) * cameraZoom;

  // Interaction State Timeline (local frames 0 to 300)
  const activeWeight = frame < 65 ? 10 : frame < 115 ? 15 : 20;
  const isMethodActive = frame >= 150;

  // Payoff state: triggers at frame 155 with bouncy spring
  const isPayoffStarted = frame >= 155;
  const payoffSpring = spring({
    frame: frame - 158,
    fps,
    config: bouncyConfig,
  });

  // Date ticker animation between frames 155 and 190
  let displayDate = 'Calculating...';
  if (frame < 155) {
    displayDate = 'Tuesday, Nov 24 at 10:00 AM';
  } else if (frame < 163) {
    displayDate = 'Wednesday, Nov 25 at 8:00 PM';
  } else if (frame < 171) {
    displayDate = 'Tuesday, Nov 24 at 2:00 PM';
  } else if (frame < 179) {
    displayDate = 'Monday, Nov 23 at 9:30 AM';
  } else {
    displayDate = 'Monday, Nov 23 at 4:00 AM';
  }

  // Emerald badge spring (frame 188) with bouncy pop
  const badgeSpring = spring({
    frame: frame - 188,
    fps,
    config: bouncyConfig,
  });

  // 3D pop forward values for the result payoff card
  const payoffZ = isPayoffStarted ? interpolate(payoffSpring, [0, 1], [0, 48]) : 0;
  const payoffScale = isPayoffStarted ? interpolate(payoffSpring, [0, 1], [0.94, 1.03]) : 1;

  // Amber glow intensity on result card
  const amberGlow = isPayoffStarted
    ? interpolate(payoffSpring, [0, 1], [0, 1]) * (0.85 + Math.sin(frame * 0.12) * 0.15)
    : 0;

  // Snappy scale-down zoom transition out (frames 275-300)
  const exitOpacity = interpolate(frame, [275, 298], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitScale = interpolate(frame, [275, 298], [1, 0.88], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Cursor Positions (Landscape vs Vertical)
  const cursorCoordinates = isVertical
    ? {
        start: { x: 800, y: 500 },
        p15: { x: 420, y: 720 },
        p20: { x: 620, y: 720 },
        method: { x: 380, y: 920 },
      }
    : {
        start: { x: 1050, y: 380 },
        p15: { x: 620, y: 495 },
        p20: { x: 720, y: 495 },
        method: { x: 580, y: 645 },
      };

  return (
    <div
      style={{
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
      }}
      className="absolute inset-0 flex items-center justify-center p-6 md:p-12 overflow-hidden select-none z-10"
    >
      {/* 3D Scene Wrapper with Dynamic Perspective */}
      <div
        style={{
          perspective: 1200,
          transformStyle: 'preserve-3d',
        }}
        className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-center"
      >
        <div
          style={{
            transform: `scale(${mockScale}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.05s ease-out',
          }}
          className={`w-full rounded-2xl md:rounded-3xl border border-white/[0.12] bg-[#0A0D14]/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),_0_0_40px_rgba(234,88,12,0.15)] backdrop-blur-xl overflow-hidden ${
            isVertical ? 'max-w-[920px] p-8 md:p-10' : 'p-8 md:p-10'
          }`}
        >
          {/* Top Window Bar */}
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500/80 inline-block shadow-sm" />
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500/80 inline-block shadow-sm" />
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 inline-block shadow-sm" />
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-neutral-300 shadow-inner">
              <span className="text-orange-500 font-semibold">https://</span>
              <span>turkeythawclock.pages.dev</span>
            </div>
            <div className="text-xs font-mono text-orange-400/80 hidden sm:block">
              // PRECISION CALCULATOR
            </div>
          </div>

          {/* Main Dashboard Layout */}
          <div
            style={{ transformStyle: 'preserve-3d' }}
            className={`grid gap-8 items-stretch ${
              isVertical ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'
            }`}
          >
            {/* Left Column: Interactive Inputs */}
            <div className={`space-y-6 ${isVertical ? '' : 'lg:col-span-7'}`}>
              <div>
                <div className="text-xs font-mono tracking-wider text-orange-400 font-semibold uppercase mb-1">
                  // 01 SELECT TURKEY WEIGHT
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                  Target Bird Specifications
                </h2>
              </div>

              {/* Weight Selector Quick Pills */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>Standard Sizes</span>
                  <span className="text-orange-400 font-semibold tabular-nums">
                    {activeWeight} LBS (SELECTED)
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2.5">
                  {[10, 15, 20, 25].map((w) => {
                    const isActive = activeWeight === w;
                    return (
                      <div
                        key={w}
                        className={`py-3 px-3 rounded-xl font-mono text-sm font-bold text-center border transition-all duration-200 ${
                          isActive
                            ? 'bg-[#EA580C] text-white border-orange-400 shadow-[0_0_25px_rgba(234,88,12,0.55)] scale-[1.05]'
                            : 'bg-white/[0.03] text-neutral-300 border-white/[0.08] hover:bg-white/[0.06]'
                        }`}
                      >
                        {w} lb
                      </div>
                    );
                  })}
                </div>

                {/* Simulated weight range slider */}
                <div className="pt-2">
                  <div className="h-2.5 w-full bg-white/[0.08] rounded-full overflow-hidden relative">
                    <div
                      style={{
                        width: `${((activeWeight - 8) / 22) * 100}%`,
                      }}
                      className="h-full bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_12px_rgba(234,88,12,0.6)] transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Method Selector */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-mono tracking-wider text-neutral-400 uppercase">
                  // 02 THAWING METHOD
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    className={`p-3.5 rounded-xl border font-mono text-xs transition-all duration-200 flex items-center justify-between ${
                      isMethodActive
                        ? 'bg-orange-950/45 border-orange-500/60 text-white shadow-[0_0_25px_rgba(234,88,12,0.3)] scale-[1.02]'
                        : 'bg-white/[0.03] border-white/[0.08] text-neutral-400'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-sm text-white">
                        [ 01 ] Refrigerator
                      </span>
                      <span className="text-[11px] text-orange-400">@ 40°F (USDA Safe)</span>
                    </div>
                    {isMethodActive && (
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02] font-mono text-xs text-neutral-500 flex flex-col gap-0.5 opacity-60">
                    <span className="font-semibold text-neutral-400">[ 02 ] Cold Water Bath</span>
                    <span className="text-[11px] text-neutral-500">30-min rotations</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Payoff Card (Pops forward towards the camera in 3D!) */}
            <div
              style={{
                transform: `translateZ(${payoffZ}px) scale(${payoffScale})`,
                boxShadow: isPayoffStarted
                  ? `0 25px 60px rgba(0,0,0,0.8), 0 0 80px rgba(234, 88, 12, ${amberGlow * 0.55})`
                  : 'none',
                transformStyle: 'preserve-3d',
              }}
              className={`relative rounded-2xl border transition-all duration-300 p-6 md:p-8 flex flex-col justify-between overflow-hidden ${
                isPayoffStarted
                  ? 'border-orange-500/60 bg-[#0F1420]'
                  : 'border-white/[0.08] bg-[#0E1017]'
              } ${isVertical ? '' : 'lg:col-span-5'}`}
            >
              {/* Backlight Glow Blob */}
              <div
                style={{
                  opacity: amberGlow,
                }}
                className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-orange-600/35 blur-3xl pointer-events-none"
              />

              {/* Card Header */}
              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono tracking-wider text-orange-400 font-bold uppercase">
                    // THAW INITIATION TIME
                  </span>
                  <span className="font-mono text-xs text-neutral-400">USDA COMPLIANT</span>
                </div>

                <div className="text-xs text-neutral-400 font-mono">
                  Feast Target: <span className="text-white font-medium">Thursday, Nov 26 @ 3:00 PM</span>
                </div>
              </div>

              {/* Giant Snapping Payoff Timestamp (Pops forward in 3D) */}
              <div
                style={{
                  transform: `translateZ(${isPayoffStarted ? 20 : 0}px)`,
                }}
                className="relative z-10 my-6"
              >
                <div className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-1">
                  START THAWING BY:
                </div>
                <div className="font-sans font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-[-0.03em] leading-tight">
                  <span className="text-orange-500 drop-shadow-[0_0_28px_rgba(234,88,12,0.65)]">
                    {displayDate}
                  </span>
                </div>
                <div className="mt-2 text-xs font-mono text-neutral-300 tabular-nums">
                  Duration: <strong className="text-white font-bold">4 days 11 hours</strong> (107 hrs total)
                </div>
              </div>

              {/* Safety Status Pill (Pops forward in 3D towards camera) */}
              <div
                style={{
                  transform: `translateZ(${isPayoffStarted ? 30 : 0}px)`,
                }}
                className="relative z-10 pt-4 border-t border-white/[0.08]"
              >
                <div
                  style={{
                    opacity: interpolate(badgeSpring, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(badgeSpring, [0, 1], [25, 0])}px) scale(${interpolate(
                      badgeSpring,
                      [0, 1],
                      [0.75, 1.05]
                    )})`,
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/40 bg-emerald-950/50 text-emerald-400 text-xs font-mono font-bold shadow-[0_0_25px_rgba(16,185,129,0.3)]"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>● SAFE & ON SCHEDULE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated SVG Cursor Glide Simulation */}
      {frame >= 25 && frame < 85 && (
        <AnimatedCursor
          startX={cursorCoordinates.start.x}
          startY={cursorCoordinates.start.y}
          targetX={cursorCoordinates.p15.x}
          targetY={cursorCoordinates.p15.y}
          startFrame={25}
          endFrame={55}
          clickFrame={56}
        />
      )}

      {frame >= 75 && frame < 135 && (
        <AnimatedCursor
          startX={cursorCoordinates.p15.x}
          startY={cursorCoordinates.p15.y}
          targetX={cursorCoordinates.p20.x}
          targetY={cursorCoordinates.p20.y}
          startFrame={75}
          endFrame={105}
          clickFrame={108}
        />
      )}

      {frame >= 125 && frame < 220 && (
        <AnimatedCursor
          startX={cursorCoordinates.p20.x}
          startY={cursorCoordinates.p20.y}
          targetX={cursorCoordinates.method.x}
          targetY={cursorCoordinates.method.y}
          startFrame={125}
          endFrame={150}
          clickFrame={152}
        />
      )}
    </div>
  );
};
