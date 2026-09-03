import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../theme';

export type Tap = { x: number; y: number; at: number };

/** Soft touch dot + ripple. Replaces the mouse cursor entirely. */
export const TouchTap: React.FC<{ taps: Tap[] }> = ({ taps }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {taps.map((t, i) => {
        const local = frame - t.at;
        if (local < 0 || local > 42) return null;
        const dot = spring({ frame: local, fps, config: { damping: 14, stiffness: 220 }, durationInFrames: 16 });
        const dotFade = interpolate(local, [0, 5, 24, 36], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const ring = interpolate(local, [0, 30], [0.25, 2.5], { extrapolateRight: 'clamp' });
        const ringFade = interpolate(local, [0, 6, 30], [0, 0.7, 0], { extrapolateRight: 'clamp' });
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: 'absolute',
                left: t.x,
                top: t.y,
                width: 96,
                height: 96,
                marginLeft: -48,
                marginTop: -48,
                borderRadius: '50%',
                border: `3px solid ${C.violet}`,
                opacity: ringFade,
                transform: `scale(${ring})`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: t.x,
                top: t.y,
                width: 54,
                height: 54,
                marginLeft: -27,
                marginTop: -27,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.92)',
                boxShadow: `0 0 34px ${C.violet}cc`,
                opacity: dotFade,
                transform: `scale(${interpolate(dot, [0, 1], [0.4, 1])})`,
              }}
            />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
