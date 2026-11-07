import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface Scene1HookProps {
  isVertical?: boolean;
}

export const Scene1Hook: React.FC<Scene1HookProps> = ({ isVertical = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Bouncy spring config
  const bouncyConfig = { mass: 0.5, damping: 10, stiffness: 120 };

  // Words breakdown
  const words = [
    { text: 'Still', start: 10 },
    { text: 'guessing', start: 18 },
    { text: 'when', start: 26 },
    { text: 'to', start: 34 },
    { text: 'thaw', start: 42 },
    { text: 'your', start: 50 },
    { text: '20 lb', start: 60, highlight: true },
    { text: 'turkey?', start: 70 },
  ];

  // Eyebrow tag spring
  const eyebrowSpring = spring({
    frame: frame - 4,
    fps,
    config: bouncyConfig,
  });

  // Warning pill spring (frame 86)
  const warningSpring = spring({
    frame: frame - 86,
    fps,
    config: bouncyConfig,
  });

  // Ambient floating motion
  const ambientY = Math.sin(frame * 0.04) * 6;

  // Pulse effect for warning border/glow
  const pulse = Math.sin(frame * 0.22) * 0.4 + 0.6;

  // Snappy scale-down zoom transition out (frames 155 to 180)
  const sceneScale = interpolate(frame, [155, 180], [1, 0.88], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sceneOpacity = interpolate(frame, [158, 180], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        transform: `scale(${sceneScale}) translateY(${ambientY}px)`,
        opacity: sceneOpacity,
      }}
      className="absolute inset-0 flex flex-col items-center justify-center p-8 select-none z-10"
    >
      {/* Center Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
        {/* Eyebrow Alert Tag */}
        <div
          style={{
            opacity: interpolate(eyebrowSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(eyebrowSpring, [0, 1], [30, 0])}px) scale(${interpolate(
              eyebrowSpring,
              [0, 1],
              [0.85, 1]
            )})`,
          }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-orange-500/40 bg-orange-950/30 text-orange-400 font-mono text-xs md:text-sm tracking-wider uppercase mb-8 shadow-[0_0_20px_rgba(234,88,12,0.25)]"
        >
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span>// CRITICAL THANKSGIVING COUNTDOWN</span>
        </div>

        {/* Kinetic Headline with Bouncy Spring Physics */}
        <h1
          className={`font-sans tracking-[-0.04em] font-extrabold text-white leading-[1.12] flex flex-wrap items-center justify-center gap-x-4 md:gap-x-6 gap-y-3 ${
            isVertical ? 'text-6xl md:text-7xl max-w-2xl' : 'text-6xl md:text-7xl lg:text-8xl max-w-4xl'
          }`}
        >
          {words.map((w, idx) => {
            const wordSpring = spring({
              frame: frame - w.start,
              fps,
              config: bouncyConfig,
            });
            const wordY = interpolate(wordSpring, [0, 1], [65, 0]);
            const wordOpacity = interpolate(wordSpring, [0, 1], [0, 1]);
            const wordScale = interpolate(wordSpring, [0, 1], [0.8, 1]);
            const wordRotate = interpolate(wordSpring, [0, 1], [idx % 2 === 0 ? -4 : 4, 0]);

            return (
              <span
                key={idx}
                style={{
                  opacity: wordOpacity,
                  transform: `translateY(${wordY}px) scale(${wordScale}) rotate(${wordRotate}deg)`,
                  display: 'inline-block',
                }}
                className={
                  w.highlight
                    ? 'text-orange-500 font-mono underline decoration-orange-500/40 decoration-wavy underline-offset-8 drop-shadow-[0_0_30px_rgba(234,88,12,0.7)]'
                    : 'text-white'
                }
              >
                {w.text}
              </span>
            );
          })}
        </h1>

        {/* Warning Trigger Pill (Bouncy spring slam at frame 86) */}
        <div
          style={{
            opacity: interpolate(warningSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(warningSpring, [0, 1], [70, 0])}px) scale(${interpolate(
              warningSpring,
              [0, 1],
              [0.85, 1]
            )})`,
            boxShadow: `0 0 45px rgba(234, 88, 12, ${pulse * 0.45})`,
          }}
          className={`mt-10 md:mt-14 inline-flex flex-col sm:flex-row items-center gap-3 px-8 py-4 rounded-2xl border border-orange-500/50 bg-orange-950/45 text-orange-400 backdrop-blur-md transition-all ${
            isVertical ? 'w-full max-w-xl text-base' : 'max-w-2xl text-sm'
          }`}
        >
          <div className="flex items-center gap-2.5 font-mono font-semibold tracking-tight">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-orange-500/25 text-orange-400 border border-orange-500/40 text-xs font-bold">
              !
            </span>
            <span>ROOM TEMP = BACTERIA DANGER ZONE</span>
          </div>
          <span className="hidden sm:inline text-orange-500/40 font-mono">•</span>
          <span className="font-mono text-neutral-300 font-medium tabular-nums">
            40°F – 140°F
          </span>
        </div>
      </div>
    </div>
  );
};
