import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

const TOUCH = 'rgba(255,255,255,0.92)';

/**
 * Replaces the recorded mouse pointer with a touch dot plus tap ripples.
 * The dot is opaque enough to fully cover the 24x26px cursor sprite.
 */
export const TouchLayer: React.FC<{
  startFrom: number;
  track: (number[] | null)[];
  taps: number[];
  screenScale?: number;
}> = ({ startFrom, track, taps, screenScale = 1 }) => {
  const frame = useCurrentFrame();
  const srcFrame = startFrom + frame;
  const point = track[srcFrame] ?? null;

  // Nearest tap within this beat, used to drive the ripple + press states.
  const activeTaps = taps.filter((t) => t >= srcFrame - 26 && t <= srcFrame + 2);

  if (!point) return null;
  const [x, y] = point;

  const pressed = activeTaps.some((t) => srcFrame >= t - 2 && srcFrame <= t + 6);
  const press = pressed ? 0.82 : 1;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {activeTaps.map((t) => {
        const age = srcFrame - t;
        if (age < 0) return null;
        const p = interpolate(age, [0, 24], [0, 1], { extrapolateRight: 'clamp' });
        const size = interpolate(p, [0, 1], [26, 132]) * screenScale;
        const opacity = interpolate(p, [0, 0.25, 1], [0.55, 0.42, 0]);
        return (
          <div
            key={t}
            style={{
              position: 'absolute',
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: '50%',
              border: `${interpolate(p, [0, 1], [5, 1.2])}px solid rgba(255,255,255,${opacity})`,
              boxShadow: `0 0 ${interpolate(p, [0, 1], [16, 40])}px rgba(255,255,255,${opacity * 0.5})`,
            }}
          />
        );
      })}

      {/* soft halo */}
      <div
        style={{
          position: 'absolute',
          left: x - 33,
          top: y - 33,
          width: 66,
          height: 66,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.12) 55%, rgba(255,255,255,0) 72%)',
          transform: `scale(${press === 1 ? 1 : 1.12})`,
        }}
      />
      {/* the finger dot — fully covers the recorded cursor */}
      <div
        style={{
          position: 'absolute',
          left: x - 19,
          top: y - 19,
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: TOUCH,
          border: '2px solid rgba(13,13,26,0.35)',
          boxShadow: '0 6px 18px rgba(0,0,0,0.45)',
          transform: `scale(${press})`,
        }}
      />
    </AbsoluteFill>
  );
};
