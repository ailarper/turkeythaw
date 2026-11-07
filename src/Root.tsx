import React from 'react';
import { Composition } from 'remotion';
import { TurkeyThawVideo } from './compositions/TurkeyThawVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 16:9 Landscape for X, YouTube, ProductHunt */}
      <Composition
        id="TurkeyThawLandscape"
        component={TurkeyThawVideo}
        durationInFrames={1080}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{
          isVertical: false,
        }}
      />

      {/* 9:16 Vertical for TikTok, Instagram Reels, YouTube Shorts */}
      <Composition
        id="TurkeyThawVertical"
        component={TurkeyThawVideo}
        durationInFrames={1080}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{
          isVertical: true,
        }}
      />
    </>
  );
};
