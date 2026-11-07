import React from 'react';
import { Audio, interpolate, Sequence, staticFile } from 'remotion';
import { AmbientBackground } from '../components/AmbientBackground';
import { Scene1Hook } from './Scene1Hook';
import { Scene2HeroMockup } from './Scene2HeroMockup';
import { Scene3Features } from './Scene3Features';
import { Scene4Outro } from './Scene4Outro';

export interface TurkeyThawVideoProps {
  isVertical?: boolean;
}

export const TurkeyThawVideo: React.FC<TurkeyThawVideoProps> = ({ isVertical = false }) => {
  return (
    <div
      style={{
        backgroundColor: '#0B0D13',
        color: '#FFFFFF',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
      className="relative w-full h-full overflow-hidden select-none"
    >
      {/* Dynamic Ambient Background with organic light drift */}
      <AmbientBackground isVertical={isVertical} />

      {/* ========================================================
          AUDIO INTEGRATION: BGM & SYNCHRONIZED SFX
          ======================================================== */}

      {/* 1. Punchy Upbeat Modern Synthwave Background Track (18.0s) */}
      <Sequence from={0} durationInFrames={1080} name="Audio - Synthwave BGM">
        <Audio
          src={staticFile('audio/bgm.wav')}
          volume={(f) =>
            interpolate(f, [1020, 1080], [0.8, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          }
        />
      </Sequence>

      {/* 2. Scene 1 SFX: Headline Reveal Whoosh / Impact (Frame 14) */}
      <Sequence from={14} durationInFrames={30} name="SFX - Headline Whoosh">
        <Audio src={staticFile('audio/whoosh.wav')} volume={0.65} />
      </Sequence>

      {/* 3. Scene 1 SFX: Warning Pill Trigger Impact (Frame 90) */}
      <Sequence from={90} durationInFrames={30} name="SFX - Warning Whoosh">
        <Audio src={staticFile('audio/whoosh.wav')} volume={0.4} />
      </Sequence>

      {/* 4. Scene 2 SFX: Cursor Click 15 lb (Global Frame 236) */}
      <Sequence from={236} durationInFrames={10} name="SFX - Click 15lb">
        <Audio src={staticFile('audio/click.wav')} volume={0.45} />
      </Sequence>

      {/* 5. Scene 2 SFX: Cursor Click 20 lb Active (Global Frame 288) */}
      <Sequence from={288} durationInFrames={10} name="SFX - Click 20lb">
        <Audio src={staticFile('audio/click.wav')} volume={0.5} />
      </Sequence>

      {/* 6. Scene 2 SFX: Cursor Click Method Toggle (Global Frame 332) */}
      <Sequence from={332} durationInFrames={10} name="SFX - Click Method">
        <Audio src={staticFile('audio/click.wav')} volume={0.45} />
      </Sequence>

      {/* 7. Scene 2 SFX: Crisp Chime / Lock-in Payoff (Global Frame 370) */}
      <Sequence from={370} durationInFrames={80} name="SFX - Schedule Lock Chime">
        <Audio src={staticFile('audio/chime.wav')} volume={0.75} />
      </Sequence>

      {/* 8. Scene 3 SFX: Feature Blitz Transition Whoosh (Global Frame 480) */}
      <Sequence from={480} durationInFrames={30} name="SFX - Feature Blitz Whoosh">
        <Audio src={staticFile('audio/whoosh.wav')} volume={0.35} />
      </Sequence>

      {/* 9. Scene 4 SFX: CTA Button Chime (Global Frame 845) */}
      <Sequence from={845} durationInFrames={75} name="SFX - Outro CTA Chime">
        <Audio src={staticFile('audio/chime.wav')} volume={0.55} />
      </Sequence>

      {/* ========================================================
          VISUAL SCENE SEQUENCE (1,080 FRAMES TOTAL)
          ======================================================== */}

      {/* Scene 1: The Problem Hook (Frames 0 - 180 | 0.0s - 3.0s) */}
      <Sequence from={0} durationInFrames={180} name="Scene 1 - The Hook">
        <Scene1Hook isVertical={isVertical} />
      </Sequence>

      {/* Scene 2: 3D Hero UI Simulation (Frames 180 - 480 | 3.0s - 8.0s) */}
      <Sequence from={180} durationInFrames={300} name="Scene 2 - 3D Hero UI">
        <Scene2HeroMockup isVertical={isVertical} />
      </Sequence>

      {/* Scene 3: Feature Blitz (Frames 480 - 780 | 8.0s - 13.0s) */}
      <Sequence from={480} durationInFrames={300} name="Scene 3 - Feature Blitz">
        <Scene3Features isVertical={isVertical} />
      </Sequence>

      {/* Scene 4: Monochromatic Outro & CTA (Frames 780 - 1080 | 13.0s - 18.0s) */}
      <Sequence from={780} durationInFrames={300} name="Scene 4 - Outro & CTA">
        <Scene4Outro isVertical={isVertical} />
      </Sequence>
    </div>
  );
};
