import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface AnimatedCursorProps {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  startFrame: number;
  endFrame: number;
  clickFrame?: number;
}

export const AnimatedCursor: React.FC<AnimatedCursorProps> = ({
  startX,
  startY,
  targetX,
  targetY,
  startFrame,
  endFrame,
  clickFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Position interpolation
  const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const smoothProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 22, mass: 0.9, stiffness: 180 },
  });

  const currentX = interpolate(smoothProgress, [0, 1], [startX, targetX]);
  const currentY = interpolate(smoothProgress, [0, 1], [startY, targetY]);

  // Click bounce
  const isClicking = clickFrame && frame >= clickFrame && frame <= clickFrame + 18;
  const clickScale = isClicking
    ? interpolate(frame, [clickFrame, clickFrame + 6, clickFrame + 18], [1, 0.82, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  // Click ripple
  const showRipple = clickFrame && frame >= clickFrame && frame <= clickFrame + 30;
  const rippleScale = showRipple
    ? interpolate(frame, [clickFrame, clickFrame + 25], [0.5, 2.4], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;
  const rippleOpacity = showRipple
    ? interpolate(frame, [clickFrame, clickFrame + 25], [0.8, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  if (frame < startFrame - 5) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: currentX,
        top: currentY,
        transform: `translate(-2px, -2px) scale(${clickScale})`,
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {/* Click ripple */}
      {showRipple && (
        <div
          style={{
            position: 'absolute',
            left: 2,
            top: 2,
            width: 24,
            height: 24,
            borderRadius: '9999px',
            border: '2px solid #EA580C',
            transform: `translate(-50%, -50%) scale(${rippleScale})`,
            opacity: rippleOpacity,
          }}
        />
      )}

      {/* SVG Modern Cursor */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6))',
        }}
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill="#FFFFFF"
          stroke="#0B0D13"
          strokeWidth="1.5"
        />
        <path
          d="M6.5 12.5L10 19.5L7.5 20.8L4 13.8L6.5 12.5Z"
          fill="#FFFFFF"
          stroke="#0B0D13"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
};
