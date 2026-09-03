import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../theme';

const Glyph: React.FC<{ size: number; color: string; rotate: number }> = ({ size, color, rotate }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: `rotate(${rotate}deg)` }}>
    <path
      d="M50 2 C56 34 66 44 98 50 C66 56 56 66 50 98 C44 66 34 56 2 50 C34 44 44 34 50 2 Z"
      fill={color}
    />
  </svg>
);

export type Spark = { x: number; y: number; size: number; at: number; color?: string };

/** Four-point sparkle glyphs that pop at each AI moment. */
export const Sparkles: React.FC<{ sparks: Spark[] }> = ({ sparks }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {sparks.map((s, i) => {
        const local = frame - s.at;
        const pop = spring({ frame: local, fps, config: { damping: 11, stiffness: 190 }, durationInFrames: 22 });
        const fade = interpolate(local, [0, 6, 34, 52], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        if (local < -2 || fade <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: s.x,
              top: s.y,
              opacity: fade,
              transform: `translate(-50%,-50%) scale(${pop}) rotate(${local * 1.4}deg)`,
              filter: `drop-shadow(0 0 18px ${(s.color ?? C.magenta)}aa)`,
            }}
          >
            <Glyph size={s.size} color={s.color ?? C.magenta} rotate={0} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
