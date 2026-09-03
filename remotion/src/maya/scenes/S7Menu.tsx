import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, SHOT } from '../theme';
import { DeviceWindow } from '../components/DeviceWindow';
import { Headline } from '../components/Headline';
import { Sparkles } from '../components/Sparkles';

const ROWS = [
  'Osso Buco · 32.00 · Entree',
  'Grilled Barramundi · 28.50 · Entree',
  'Veal Scallopini · 30.00 · Entree',
  'Lobster Linguine · 36.00 · Entree',
  'Truffle Risotto · 26.00 · Entree',
  'Tiramisu · 12.00 · Dessert',
  'Affogato · 9.50 · Dessert',
  'Panna Cotta · 11.00 · Dessert',
];

/** A bulk-upload panel whose rows populate in a rapid stagger. */
const BulkPanel: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - at;
  if (local < -2) return null;
  const enter = spring({ frame: local, fps, config: { damping: 200 }, durationInFrames: 22 });

  return (
    <div
      style={{
        position: 'absolute',
        right: 120,
        top: 150,
        width: 640,
        padding: '26px 28px 20px',
        borderRadius: 24,
        background: 'linear-gradient(135deg, rgba(20,20,34,0.97), rgba(8,8,16,0.96))',
        border: `1px solid ${C.violet}66`,
        boxShadow: '0 34px 90px rgba(0,0,0,0.7)',
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [50, 0])}px)`,
      }}
    >
      <div
        style={{
          fontFamily: 'Montserrat',
          fontWeight: 800,
          fontSize: 19,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: C.violet,
          marginBottom: 18,
        }}
      >
        AI bulk upload · menu.csv
      </div>
      {ROWS.map((row, i) => {
        const rowIn = interpolate(local, [16 + i * 6, 28 + i * 6], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={row}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '11px 14px',
              marginBottom: 8,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.045)',
              opacity: rowIn,
              transform: `translateX(${interpolate(rowIn, [0, 1], [26, 0])}px)`,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: C.teal,
                flexShrink: 0,
                boxShadow: `0 0 14px ${C.teal}99`,
              }}
            />
            <div style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: 21, color: C.cream }}>{row}</div>
          </div>
        );
      })}
    </div>
  );
};

/** Scene 7 — menu updates in minutes via AI-driven bulk upload. */
export const S7Menu: React.FC = () => (
  <AbsoluteFill>
    <DeviceWindow
      src={SHOT.menuChat}
      from={{ scale: 1.02, x: 300, y: 0 }}
      to={{ scale: 1.08, x: 260, y: 0 }}
      width={1460}
      align="left"
    />
    <AbsoluteFill style={{ background: 'linear-gradient(90deg, transparent 30%, rgba(5,6,12,0.8) 56%)' }} />
    <BulkPanel at={14} />
    <Sparkles sparks={[{ x: 1180, y: 190, size: 52, at: 30 }]} />
    <Headline
      eyebrow="Minutes, not hours"
      line1="Your whole menu,"
      line2="uploaded in one pass."
      accent={C.violet}
      size={70}
      delay={22}
    />
  </AbsoluteFill>
);
