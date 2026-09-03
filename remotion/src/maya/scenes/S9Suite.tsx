import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, SUITE, TILE_FRAMES, framePath } from '../theme';
import { Sparkles } from '../components/Sparkles';

const Tile: React.FC<{ dir: string; label: string; at: number }> = ({ dir, label, at }) => {
  const frame = useCurrentFrame();
  const local = frame - at;
  if (local < 0) return null;
  const enter = interpolate(local, [0, 14], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div style={{ opacity: enter }}>
      <div
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 26px 70px rgba(0,0,0,0.65)',
          background: C.bg1,
        }}
      >
        <Img src={staticFile(framePath(dir, frame, TILE_FRAMES))} style={{ width: '100%', display: 'block' }} />
      </div>
      <div
        style={{
          marginTop: 10,
          textAlign: 'center',
          fontFamily: 'Montserrat',
          fontWeight: 800,
          fontSize: 22,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: C.pink,
        }}
      >
        {label}
      </div>
    </div>
  );
};

const ClosingLine: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [at, at + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 54,
        textAlign: 'center',
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: 'Montserrat',
          fontWeight: 900,
          fontSize: 58,
          letterSpacing: -1,
          color: C.white,
          textShadow: '0 14px 44px rgba(0,0,0,0.9)',
        }}
      >
        Maya. Running the restaurant,
      </div>
      <div
        style={{
          marginTop: 8,
          fontFamily: 'Montserrat',
          fontWeight: 900,
          fontSize: 44,
          letterSpacing: -0.5,
          color: C.pink,
          textShadow: '0 12px 36px rgba(0,0,0,0.85)',
        }}
      >
        so you can run the room.
      </div>
    </div>
  );
};

/** Scene 9 — the whole eatOS suite running at once. */
export const S9Suite: React.FC = () => (
  <AbsoluteFill>
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '52px 90px 210px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '26px 34px',
          width: '100%',
        }}
      >
        {SUITE.map((s, i) => (
          <Tile key={s.dir} dir={s.dir} label={s.label} at={i * 9} />
        ))}
      </div>
    </AbsoluteFill>

    <AbsoluteFill
      style={{ background: 'linear-gradient(0deg, rgba(4,5,11,0.95) 0%, rgba(4,5,11,0.55) 22%, transparent 42%)' }}
    />

    <Sparkles
      sparks={[
        { x: 960, y: 210, size: 58, at: 74 },
        { x: 300, y: 560, size: 42, at: 96, color: C.pink },
      ]}
    />

    <ClosingLine at={70} />
  </AbsoluteFill>
);
