import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface WatermarkProps {
  speed?: number;
  opacity?: number;
}

export const Watermark: React.FC<WatermarkProps> = ({
  speed = 0.5,
  opacity = 0.04,
}) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 1080], [0, -180 * speed]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      }}
    >
      <div
        style={{
          transform: `translateX(${drift}px)`,
          whiteSpace: 'nowrap',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontWeight: 900,
          fontSize: '14vw',
          lineHeight: 1,
          letterSpacing: '-0.06em',
          color: `rgba(255, 255, 255, ${opacity})`,
          userSelect: 'none',
        }}
      >
        {'//TurkeyThawClock //TurkeyThawClock //TurkeyThawClock'}
      </div>
    </div>
  );
};
