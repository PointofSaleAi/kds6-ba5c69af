import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, SHOT } from '../theme';
import { DeviceWindow } from '../components/DeviceWindow';
import { Headline } from '../components/Headline';
import { Sparkles } from '../components/Sparkles';
import { TouchTap } from '../components/TouchTap';

const BARS = 24;

/** Bars that build in over the report's chart area, wiping the still image in. */
const BuildingChart: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const local = frame - at;
  if (local < 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: '17%',
        right: '31%',
        bottom: '14%',
        height: '46%',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 6,
      }}
    >
      {new Array(BARS).fill(0).map((_, i) => {
        const grow = interpolate(local, [i * 1.6, i * 1.6 + 16], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const h = (0.22 + 0.72 * Math.abs(Math.sin((i / BARS) * Math.PI * 1.7))) * grow;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h * 100}%`,
              borderRadius: 3,
              background: `linear-gradient(180deg, ${C.teal}, ${C.teal}66)`,
              opacity: interpolate(local, [40, 62], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              boxShadow: `0 0 14px ${C.teal}55`,
            }}
          />
        );
      })}
    </div>
  );
};

/** Scene 5 — a saved AI report opening full screen. */
export const S5Reports: React.FC = () => (
  <AbsoluteFill>
    <DeviceWindow
      src={SHOT.menusync}
      from={{ scale: 0.98, x: 0, y: 0 }}
      to={{ scale: 1.09, x: -60, y: 10 }}
      width={1580}
    >
      <BuildingChart at={16} />
    </DeviceWindow>
    <TouchTap taps={[{ x: 1050, y: 300, at: 12 }]} />
    <Sparkles
      sparks={[
        { x: 1470, y: 250, size: 58, at: 44 },
        { x: 400, y: 690, size: 40, at: 66, color: C.violet },
      ]}
    />
    <Headline
      eyebrow="Built for you, every day"
      line1="Reports ready before"
      line2="you think to ask."
      accent={C.teal}
      size={76}
      delay={54}
    />
  </AbsoluteFill>
);
