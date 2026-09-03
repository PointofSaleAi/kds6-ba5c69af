import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, SHOT } from '../theme';
import { DeviceWindow } from '../components/DeviceWindow';
import { Headline } from '../components/Headline';
import { Sparkles } from '../components/Sparkles';
import { TypedQuery } from '../components/TypedQuery';

const Confirm: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - at;
  if (local < -2) return null;
  const pop = spring({ frame: local, fps, config: { damping: 14, stiffness: 170 }, durationInFrames: 24 });

  return (
    <div
      style={{
        position: 'absolute',
        right: 130,
        top: 190,
        width: 560,
        padding: '24px 28px',
        borderRadius: 22,
        background: 'linear-gradient(135deg, rgba(22,160,133,0.2), rgba(9,9,18,0.95))',
        border: `1px solid ${C.teal}88`,
        boxShadow: '0 30px 80px rgba(0,0,0,0.65)',
        opacity: pop,
        transform: `translateY(${interpolate(pop, [0, 1], [40, 0])}px)`,
      }}
    >
      <div style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 26, color: C.cream, lineHeight: 1.3 }}>
        Done — allergen alerts now fire on every ticket.
      </div>
      <div
        style={{
          marginTop: 12,
          fontFamily: 'Montserrat',
          fontWeight: 800,
          fontSize: 16,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: C.teal,
        }}
      >
        Settings updated by Maya
      </div>
    </div>
  );
};

/** Scene 8 — settings changed by conversation instead of menu-digging. */
export const S8Settings: React.FC = () => (
  <AbsoluteFill>
    <DeviceWindow
      src={SHOT.aiInstructions}
      from={{ scale: 1.02, x: 0, y: 0 }}
      to={{ scale: 1.1, x: -70, y: 0 }}
      width={1540}
    />
    <TypedQuery text="Turn on allergen alerts for every ticket." at={12} width={1000} />
    <Confirm at={110} />
    <Sparkles
      sparks={[
        { x: 1240, y: 300, size: 56, at: 106 },
        { x: 520, y: 660, size: 40, at: 130, color: C.violet },
      ]}
    />
    <Headline
      eyebrow="Just tell her"
      line1="Settings, without"
      line2="digging through menus."
      accent={C.blueBright}
      size={70}
      delay={140}
      place="top-left"
    />
  </AbsoluteFill>
);
